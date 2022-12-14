import qs from 'qs'
import axios from 'axios'
import puppeteer, { Page, Browser, HTTPResponse } from 'puppeteer-core'
import log from './utils/log'

const { getEdgePath } = require('edge-paths')
const chromePaths = require('chrome-paths')

const BASE_URL = 'https://www.iconfont.cn'
const LOGIN_URL = `${BASE_URL}/login`
const LOGIN_API = `${BASE_URL}/api/account/login.json`
const CREATE_CDN = `${BASE_URL}/api/project/cdn.json`
const PROJECT_DETAIL = `${BASE_URL}/api/project/detail.json`

type IconFontConfig = {
  username?: string
  password?: string
  projectId: string

  ctoken?: string
  eggSessIconfont?: string
}

export default class IconFont {
  page!: Page
  browser!: Browser
  username?: string
  password?: string
  projectId!: string
  iconInfo: Record<string, string> | null = null
  eventList: Map<string, [Function, Function]> = new Map([])

  ctoken?: string
  eggSessIconfont?: string

  cookies: Record<string, string> = {}

  constructor(config: IconFontConfig) {
    const { password, projectId, username, ctoken, eggSessIconfont } = config
    this.password = password
    this.username = username
    this.projectId = projectId

    this.ctoken = ctoken
    this.eggSessIconfont = eggSessIconfont
  }

  async init() {
    const { ctoken, eggSessIconfont } = this
    if (ctoken && eggSessIconfont) {
      this.cookies.ctoken = ctoken
      this.cookies.EGG_SESS_ICONFONT = eggSessIconfont
    } else {
      await this.initBrowser()
      this.listenPageChange()
      this.login()
    }
  }

  listenPageChange() {
    this.page.on('response', async response => {
      const url = response.url()
      const [resolve] = this.eventList.get(url) ?? []
      if (typeof resolve === 'function') resolve(response)
    })
  }

  onPageChange(url: string) {
    return new Promise<HTTPResponse>((resolve, reject) => {
      this.eventList.set(url, [resolve, reject])
    })
  }

  async getIconInfo() {
    if (this.iconInfo) return this.iconInfo
    try {
      const { ctoken, EGG_SESS_ICONFONT } = this.cookies

      if (!ctoken && !EGG_SESS_ICONFONT) {
        const response = await this.onPageChange(LOGIN_API)
        await this.loginSuccess(response)
      }

      // ??????????????????
      this.iconInfo = await this.getProjectDetail()
      await this.browser?.close()
      return this.iconInfo
    } catch (error) {
      await this.browser?.close()
      return Promise.reject(error)
    }
  }

  getChromePath() {
    const { chrome, chromium, chromeCanary } = chromePaths
    const chromePath = chrome || getEdgePath() || chromium || chromeCanary
    if (!chromePath) {
      log.error('????????? chrome ??? chromium?????? ???????????????????????? chrome ??? chromium?????? ?????????????????????')
      throw new Error("")
    }
    

    return chromePath
  }

  async initBrowser() {
    const chromePath = this.getChromePath()

    this.browser = await puppeteer.launch({ executablePath: chromePath })
    this.page = await this.browser.newPage()
  }

  async login() {
    try {
      const { username, password } = this
      if (!username || !password) throw new Error('????????????????????????')

      await this.page.goto(LOGIN_URL)
      log.info('??????????????????')

      await this.page.waitForSelector('#userid').then(async () => {
        await this.page.type('#userid', username)
        await this.page.type('#password', password)
        await this.page.keyboard.press('Enter')
        this.checkForm()
      })
    } catch (e) {
      console.error(e)
      await this.browser.close()
    }
  }

  async loginSuccess(response: HTTPResponse) {
    if (response.status() === 200) {
      // ??????????????????
      await this.handleLoginError(response)
      // ??????cookie
      await this.getCookie()
      log.success('iconfont ????????????')
    } else {
      throw new Error(`????????????[code=${response.status()}]`)
    }
  }

  async createFontInfo(cookie: string) {
    try {
      const { ctoken } = this.cookies
      const { data } = await axios.post(CREATE_CDN, qs.stringify({ t: Date.now(), pid: this.projectId, ctoken }), {
        headers: {
          cookie,
          'x-csrf-token': ctoken,
          'content-type': `application/x-www-form-urlencoded; charset=UTF-8`
        }
      })
      const { code, data: _data = {}, message } = data
      if (code === 200) {
        const { css_font_face_src } = _data
        const [, baseUrl] = css_font_face_src.match(/url\('([\s\S]*)\.woff2/)
        const woff2_file = `${baseUrl}.woff2`
        const woff_file = `${baseUrl}.woff`
        const ttf_file = `${baseUrl}.ttf`
        const js_file = `${baseUrl}.js`
        const css_file = `${baseUrl}.css`
        const json_file = `${baseUrl}.json`
        Object.assign(_data, { woff2_file, woff_file, ttf_file, js_file, css_file, json_file })
        return _data
      }
      throw new Error(message || '????????????????????????')
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // ??????????????????
  async checkForm() {
    const useridErrorLabel = await this.page.$('#userid-error')
    const passwordErrorLabel = await this.page.$('#password-error')
    let useridErrText: string | null = null
    let passwordErrText: string | null = null

    if (useridErrorLabel) {
      useridErrText = await this.page.$eval('#userid-error', el => el.textContent)
    }
    if (passwordErrorLabel) {
      passwordErrText = await this.page.$eval('#password-error', el => el.textContent)
    }
    useridErrText && log.error(`username???${useridErrText}`)
    passwordErrText && log.error(`password???${passwordErrText}`)
    if (useridErrText || passwordErrText) await this.browser.close()
  }

  async getProjectDetail() {
    const { ctoken, EGG_SESS_ICONFONT } = this.cookies
    const url = `${PROJECT_DETAIL}?pid=${this.projectId}&t=${Date.now()}&ctoken=${ctoken}`
    const cookie = `EGG_SESS_ICONFONT=${EGG_SESS_ICONFONT};ctoken=${ctoken};`

    try {
      const { data } = await axios.get(url, { headers: { cookie } })
      const { font, project } = data.data
      // ????????????????????????
      if (font === null || project.font_is_old === 1) {
        return await this.createFontInfo(cookie)
      }

      return font
    } catch (error) {
      console.error(error)
    }
  }

  // ??????????????????
  async handleLoginError(response: HTTPResponse) {
    try {
      const json = await response.json()
      if (json.code !== 200) {
        log.error(`iconfont ???????????????${JSON.stringify(json)}`)
        await this.browser.close()
      }
    } catch (e) {
      // ???????????????????????????????????????????????????????????????????????????????????????????????????
      const loginSuccessErrMsg =
        'ProtocolError: Could not load body for this request. This might happen if the request is a preflight request.'
      if (`${e}` !== loginSuccessErrMsg) {
        await this.browser.close()
        throw new Error('error')
      }
    }
  }

  async getCookie() {
    const cookies = await this.page.cookies()
    cookies.forEach(item => (this.cookies[item.name] = item.value))
  }
}
