import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import log from './utils/log'
import download from 'download'
import IconFont from './IconFont'
import { createFile, findMost, getRootFilePath, isVoid, judgeIsVaildUrl, loadPrettierConfig, ts2Js } from './utils'

const css2json = require('css2json')
class Config {
  url = ''
  outDir = './iconfont'
  iconify = { enable: false, prefix: '' }
  language = 'js' as 'js' | 'ts'
  get iconTTFPath() {
    return path.join(this.outDir, 'iconfont.ttf')
  }

  get iconTTFAddress() {
    return './iconfont.ttf'
  }

  get iconCssPath() {
    return path.join(this.outDir, 'iconfont.css')
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
    let { data: cssStr } = await axios.get<string>(`${config.url}.css`)
    cssStr = cssStr.replace(
      /src:[\s\S]*'\);/,
      `src: url('${config.iconTTFAddress}?t=${Date.now()}') format('truetype');`
    )

    const reg = /(\.iconfont\s\{[\s\S]*grayscale;\r?\n\}\r?\n)/
    const [css] = cssStr.match(reg) ?? []
    const cssObj = css2json(css)['.iconfont'] ?? {}

    const { className = '.iconfont', values = {} } = fontFamilyClass ?? {}

    Object.assign(cssObj, values)
    const newCss = Object.entries(cssObj)
      .filter(([, value]) => !isVoid(value))
      .sort(([k1], [k2]) => k1.length - k2.length)
      .map(([k, v]) => `${k}: ${v}`)
      .join(';')

    cssStr = cssStr.replace(RegExp.$1, `${className}{ ${newCss} }\r\n`)

    log.info('正在创建 iconfont.css 文件')
    createFile(config.iconCssPath, cssStr, 'css')
  } catch (error) {
    console.error(error)
  }
}

async function getIconJsCode() {
  try {
    const { data } = await axios.get<string>(`${config.url}.js`)
    const filePath = path.join(config.outDir, 'iconfont.js')
    const content = `/* eslint-disable */\r\n${data}`
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
  const filePath = path.join(config.outDir, 'index.ts')

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
  createFile(filePath, tsContent, 'typescript')

  if (config.language === 'js') {
    ts2Js([filePath], true)
    fs.unlinkSync(filePath)
  }
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

async function getIconName() {
  const { prefix, enable } = config.iconify

  const jsonPaht = `${config.url}.json`
  const { data } = await axios.get<IconJaon>(jsonPaht)

  const { glyphs, css_prefix_text } = data
  const prefixReg = new RegExp(`^${css_prefix_text}`)
  let contentFont = ''
  glyphs.forEach(item => {
    const { font_class, name } = item
    // 处理 ts 文件信息
    const iconName = font_class.replace(/-/g, '_').toUpperCase()
    const typeVlaue = `'${css_prefix_text}${font_class}'`
    contentFont += `
    /**
     * @name ${font_class}
     * @description ${name}
     */
    ${iconName}: ${typeVlaue},
    `
  })
  createIndexTs(contentFont, data)

  // 处理 Iconify 的 Json 数据
  if (enable) {
    const svgDatas = (await getSvgData()).map(i => {
      i.iconName = i.iconName.replace(prefixReg, '')
      return i
    })

    config.iconify.prefix = !prefix ? css_prefix_text : prefix
    createIconifyJson(svgDatas)
  }
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

  config.iconify = iconify

  // config.iconifyPrefix = iconifyPrefix

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

    const getName = getIconName() // 生成 icon 名称文件
    const getJsCode = getIconJsCode() // 生成 js 代码
    const getCssCode = getIconfontCss(fontFamilyClass) // 生成 css 文件
    const getTtfFile = downloadFileAsync() // 下载 字体包
    await Promise.all([getName, getJsCode, getCssCode, getTtfFile])
    setTimeout(() => {
      log.clear()
      log.info(log.done(' ALL DONE '))
    }, 800)
  } catch (error) {
    log.error('获取图标信息失败')
    console.error(error)
  }
}
