import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import log from './utils/log'
import download from 'download'
import IconFont from './IconFont'
import { createFile, getRootFilePath, isVoid, judgeIsVaildUrl, loadPrettierConfig, ts2Js } from './utils'

const css2json = require('css2json')
class Config {
  url = ''
  outDir = './iconfont'
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

async function getIconName() {
  const jsonPaht = `${config.url}.json`
  const { data } = await axios.get<IconJaon>(jsonPaht)
  const { glyphs, name, description, css_prefix_text } = data

  let contentFont = `
  import './iconfont'
  import './iconfont.css'

  /**
   * @description ${name}-字体图标名称列表 ${description}
   */
  export default {\r\n`
  glyphs.forEach(item => {
    const { font_class, name } = item
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

  contentFont += '}'

  const filePath = path.join(config.outDir, 'index.ts')

  log.info('正在创建 入口 文件')
  createFile(filePath, contentFont, 'typescript')

  if (config.language === 'js') {
    ts2Js([filePath], true)
    fs.unlinkSync(filePath)
  }
}

async function getConfig() {
  let {
    url,
    ctoken,
    projectId,
    userInfoPath,
    language = 'js',
    fontFamilyClass,
    EGG_SESS_ICONFONT,
    outDir = './src/assets/iconfont'
  } = require(getRootFilePath('./package.json')).autoIconfont ?? {}

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
