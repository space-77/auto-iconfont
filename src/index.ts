import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import log from './utils/log'
import download from 'download'
import IconFont from './IconFont'
import { createFile, findMost, getRootFilePath, isVoid, judgeIsVaildUrl, loadPrettierConfig } from './utils'

const css2json = require('css2json')
class Config {
  url = ''
  outDir = './iconfont'
  settings = { prefix: '' }
  iconify = { enable: false, prefix: '', delimiter: '' }
  language: 'js' | 'ts' = 'js'
  get iconTTFPath() {
    return path.join(this.outDir, 'iconfont.ttf')
  }

  get iconTTFAddress() {
    return './iconfont.ttf'
  }

  get iconCssPath() {
    return path.join(this.outDir, 'iconfont.css')
  }

  get canRename() {
    return this.iconify.enable && this.settings.prefix !== this.iconify.prefix + this.iconify.delimiter
  }
}

const config = new Config()

type IconJaon = {
  id: string
  name: string
  font_family: string
  description: string
  css_prefix_text: string
  glyphs: {
    name: string
    icon_id: string
    unicode: string
    font_class: string
    unicode_decimal: number
  }[]
}

type SvgData = {
  body: string
  width?: string
  height?: string
  iconName: string
}

async function downloadFileAsync() {
  const filePath = path.join(config.outDir, 'iconfont.ttf')
  log.info('正在下载 字体 文件')
  fs.writeFileSync(filePath, await download(`${config.url}.ttf`))
}

function formatUrl(url: string) {
  url = url.replace(/^(http:)?\/\//, 'https://')
  if (!/^https/.test(url)) throw new Error('图标地址异常')
  url = url.split('?')[0]
  url = url.slice(0, url.lastIndexOf('.'))
  config.url = url
}

function formatPath(outDir: string) {
  outDir = getRootFilePath(outDir)
  fs.mkdirSync(outDir, { recursive: true })
  config.outDir = outDir
}

async function getIconfontCss(fontFamilyClass: Record<string, string>) {
  try {
    const { url, iconTTFAddress, iconCssPath, iconify, settings } = config
    const { enable, prefix, delimiter } = iconify

    const { data } = await axios.get<string>(`${url}.css`)
    const cssJson = css2json(data) as Record<string, Record<string, string>>
    const { className = '.iconfont', values = {} } = fontFamilyClass ?? {}

    let cssStr = ''
    for (let [cssName, cssValue] of Object.entries(cssJson)) {
      if (cssName === '@font-face') {
        cssValue.src = `url('${iconTTFAddress}?t=${Date.now()}') format('truetype')`
      } else if (cssName === '.iconfont') {
        Object.assign(cssValue, values)
        cssName = className
      } else if (config.canRename) {
        // 开启 iconify，并且 iconfont 的 prefix 不等于 项目上的prefix，即需要修改 css 文件的icon类名
        cssName = cssName.replace(new RegExp(`^\.${settings.prefix}`), `.${prefix + delimiter}`)
      }

      const newCss = Object.entries(cssValue)
        .filter(([, value]) => !isVoid(value))
        .sort(([k1], [k2]) => k1.length - k2.length)
        .map(([k, v]) => `${k}: ${v}`)
        .join(';')

      cssStr += `${cssName} { ${newCss} }\r\n\r\n`
    }

    log.info('正在创建 iconfont.css 文件')
    createFile(iconCssPath, cssStr, 'css')
  } catch (error) {
    console.error(error)
  }
}

async function getIconJsCode() {
  try {
    const { settings, iconify } = config
    const { prefix, delimiter } = iconify

    const { data } = await axios.get<string>(`${config.url}.js`)
    const filePath = path.join(config.outDir, 'iconfont.js')
    let content = `/* eslint-disable */\r\n${data}`
    if (config.canRename) {
      const prefixReg = new RegExp(`\\sid="${settings.prefix}`, 'g')
      content = content.replace(prefixReg, ` id="${prefix + delimiter}`)
    }
    log.info('正在创建 iconfont.js 文件')
    fs.writeFileSync(filePath, content)
  } catch (error) {
    console.error(error)
  }
}

function createIconifyJson(svgDatas: SvgData[]) {
  const icons: Record<string, Omit<SvgData, 'iconName'>> = {}

  const { prefix, enable } = config.iconify
  if (!enable) return

  const mostWidth = findMost(svgDatas.map(i => i.width))
  const mostHeight = findMost(svgDatas.map(i => i.height))

  svgDatas.forEach(i => {
    let { iconName, width, height, body } = i
    width = width === mostWidth ? undefined : width
    height = height === mostHeight ? undefined : height

    icons[iconName] = { body, width, height }
  })

  const IconiftJson = {
    prefix,
    icons,
    width: mostWidth,
    height: mostHeight
  }

  const filePath = path.join(config.outDir, 'iconifyJson.json')

  createFile(filePath, JSON.stringify(IconiftJson), 'json')
}

function createIndexTs(contentFont: string, { name, description }: IconJaon) {
  const isJsFile = config.language === 'js'
  const filePrePaht = path.join(config.outDir, `index`)
  // const filePath = path.join(config.outDir, `index.${config.language}`)

  const tsContent = `
  import './iconfont'
  import './iconfont.css'

  /**
   * @description ${name}-字体图标名称列表 ${description}
   */
  export default {
    ${contentFont}
  }`

  log.info('正在创建 入口 文件')

  if (isJsFile) {
    let tsDFile = tsContent.replace('export default', 'declare const _default:')
    tsDFile = `${tsDFile}\r\nexport default _default;`
    createFile(`${filePrePaht}.d.ts`, tsDFile, 'typescript')
  }
  const filePath = `${filePrePaht}.${config.language}`
  createFile(filePath, tsContent, isJsFile ? 'babel' : 'typescript')
}

async function getSvgData(): Promise<SvgData[]> {
  try {
    const { url } = config
    const res = await axios.get(`${url}.js`)
    const iconJsData = (res.data as string) ?? ''
    const svg = iconJsData.replace(/.*<svg>([\s\S]+)<\/svg>.*/, (_, svg) => `<svg>${svg}</svg>`)
    const iconStrList = svg.match(/(<symbol.*?<\/symbol>)/g) ?? []

    return iconStrList.map(iconstr => {
      const [, attrs, body] = iconstr.match(/<symbol(.*?)>(<path.*?<\/path>)<\/symbol>/) ?? []
      const [, viewBox] = attrs.match(/viewBox="(.+)"/) ?? []
      const [, iconName] = attrs.match(/id="(\S+)"/) ?? []
      const [, , width, height] = viewBox.split(' ')
      return { body, width, height, iconName }
    })
  } catch (e) {
    console.error(e)
    throw new Error('获取 svg 信息异常')
  }
}

async function getIconInfo() {
  const { iconify, url } = config
  const { prefix, enable } = iconify

  const jsonPaht = `${url}.json`
  const { data } = await axios.get<IconJaon>(jsonPaht)

  const { glyphs, css_prefix_text } = data

  // 处理 Iconify 的 Json 数据
  if (enable) {
    if (!prefix) {
      iconify.prefix =
        css_prefix_text.replace(/(-|_)$/, str => {
          iconify.delimiter = str
          return ''
        }) || 'icon'
      iconify.delimiter = !iconify.delimiter ? '-' : iconify.delimiter
    }

    config.settings.prefix = css_prefix_text

    const prefixReg = new RegExp(`^${css_prefix_text}`)
    const svgDatas = (await getSvgData()).map(i => {
      i.iconName = i.iconName.replace(prefixReg, '').replace(/-/g, '_')
      return i
    })

    createIconifyJson(svgDatas)
  }

  let contentFont = ''
  const newPrefix = enable ? iconify.prefix + iconify.delimiter : css_prefix_text
  glyphs.forEach(item => {
    const { font_class, name } = item
    // 处理 ts 文件信息
    const iconName = font_class.replace(/-/g, '_') // .toUpperCase()
    const typeVlaue = `'${newPrefix}${font_class}'`
    contentFont += `
    /**
     * @name ${font_class}
     * @description ${name}
     */
    ${iconName}: ${typeVlaue},
    `
  })
  createIndexTs(contentFont, data)
}

async function getConfig() {
  let {
    url,
    ctoken,
    iconify = {},
    projectId,
    userInfoPath,
    // iconifyPrefix,
    language = 'js',
    fontFamilyClass,
    EGG_SESS_ICONFONT,
    outDir = './src/assets/iconfont'
  } = require(getRootFilePath('./package.json')).autoIconfont ?? {}

  const { enable, prefix = '' } = iconify

  const errMsg = 'prefix（前缀） 必须以字母开头，并且只能包含字母、数字、- 和 _'
  if (prefix !== '' && !/^[a-zA-Z](\w|-)*$/.test(prefix)) throw new Error(errMsg)

  config.iconify.enable = enable
  config.iconify.prefix = prefix.replace(/(-|_)$/, (str: string) => {
    config.iconify.delimiter = str
    return ''
  })

  if (!judgeIsVaildUrl(url)) {
    if (!projectId) throw new Error('项目id不存在！')

    if (!userInfoPath && !(EGG_SESS_ICONFONT && ctoken)) throw new Error('iconfont 地址异常，或者用户信息异常')
    let username: string | undefined
    let password: string | undefined

    if (/\.json$/i.test(userInfoPath)) {
      try {
        const res = require(getRootFilePath(userInfoPath))
        username = res.username
        password = res.password
      } catch (error) {
        const err = `${error}`
        log.error(err)
        throw new Error(err)
      }
    }
    const iconfont = new IconFont({ username, password, projectId, eggSessIconfont: EGG_SESS_ICONFONT, ctoken })

    await iconfont.init()

    const { js_file } = (await iconfont.getIconInfo()) ?? {}

    url = js_file
  }

  config.language = language
  formatUrl(url)
  formatPath(outDir)
  loadPrettierConfig() // 读取项目 prettier 配置信息

  return fontFamilyClass
}

export async function init() {
  try {
    log.clear()
    const fontFamilyClass = await getConfig() // 读取 项目配置信息

    await getIconInfo() // 获取项目配置信息 并 生成index.ts文件

    const getJsCode = getIconJsCode() // 生成 js 代码
    const getCssCode = getIconfontCss(fontFamilyClass) // 生成 css 文件
    const getTtfFile = downloadFileAsync() // 下载 字体包
    await Promise.all([getJsCode, getCssCode, getTtfFile])
    setTimeout(() => {
      log.clear()
      log.info(log.done(' ALL DONE '))
    }, 800)
  } catch (error) {
    log.error('获取图标信息失败')
    console.error(error)
  }
}
