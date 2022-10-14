import fs from 'fs-extra'
import https from 'https'
import path from 'path'
import axios from 'axios'
import IconFont from './IconFont'
import { createFile, getRootFilePath, judgeIsVaildUrl, loadPrettierConfig, ts2Js } from './utils'

// https://github.com/chenjiezi/iconfont-auto-import

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

function downloadFileAsync() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(config.outDir, 'iconfont.ttf')
    const file = fs.createWriteStream(filePath)

    https.get(`${config.url}.ttf`, res => {
      if (res.statusCode !== 200) {
        reject(res.statusCode)
        return
      }

      res.on('end', () => {
        console.log('download end')
      })

      file
        .on('finish', () => {
          console.log('finish write file')
          file.close(resolve)
        })
        .on('error', err => {
          fs.unlinkSync(filePath)
          reject(err.message)
        })

      res.pipe(file)
    })
  })
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

async function getIconfontCss() {
  try {
    let { data: cssStr } = await axios.get<string>(`${config.url}.css`)
    cssStr = cssStr.replace(
      /src:[\s\S]*'\);/,
      `src: url('${config.iconTTFAddress}?t=${Date.now()}') format('truetype');`
    )
    createFile(config.iconCssPath, cssStr)
  } catch (error) {
    console.error(error)
  }
}

async function getIconJsCode() {
  try {
    const { data } = await axios.get<string>(`${config.url}.js`)
    const filePath = path.join(config.outDir, 'iconfont.js')
    const content = `/* eslint-disable */\r\n${data}`
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
  createFile(filePath, contentFont)

  if (config.language === 'js') {
    ts2Js([filePath], true)
    fs.unlinkSync(filePath)
  }
}

async function getConfig() {
  let {
    url,
    ctoken,
    EGG_SESS_ICONFONT,
    userInfoPath,
    projectId,
    outDir = './src/assets/iconfont',
    language = 'js'
  } = require(getRootFilePath('./package.json')).autoIconfont ?? {}

  if (!judgeIsVaildUrl(url)) {
    if (!projectId) throw new Error('项目id不存在！')

    if (!userInfoPath && !(EGG_SESS_ICONFONT && ctoken)) throw new Error('iconfont 地址异常，或者用户信息异常')
    let username: string | undefined
    let password: string | undefined

    if (/\.json$/i.test(userInfoPath)) {
      const res = require(getRootFilePath(userInfoPath))
      username = res.username
      password = res.password
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
}

export async function init() {
  await getConfig() // 读取 项目配置信息

  // getIconName() // 生成 icon 名称文件
  // getIconJsCode() // 生成 js 代码
  // getIconfontCss() // 生成 css 文件
  // downloadFileAsync() // 下载 字体包
}

// init()
