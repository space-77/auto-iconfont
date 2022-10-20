"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qs_1 = __importDefault(require("qs"));
const axios_1 = __importDefault(require("axios"));
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const log_1 = __importDefault(require("./utils/log"));
const { getEdgePath } = require('edge-paths');
const chromePaths = require('chrome-paths');
const BASE_URL = 'https://www.iconfont.cn';
const LOGIN_URL = `${BASE_URL}/login`;
const LOGIN_API = `${BASE_URL}/api/account/login.json`;
const CREATE_CDN = `${BASE_URL}/api/project/cdn.json`;
const PROJECT_DETAIL = `${BASE_URL}/api/project/detail.json`;
class IconFont {
    constructor(config) {
        this.iconInfo = null;
        this.eventList = new Map([]);
        this.cookies = {};
        const { password, projectId, username, ctoken, eggSessIconfont } = config;
        this.password = password;
        this.username = username;
        this.projectId = projectId;
        this.ctoken = ctoken;
        this.eggSessIconfont = eggSessIconfont;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const { ctoken, eggSessIconfont } = this;
            if (ctoken && eggSessIconfont) {
                this.cookies.ctoken = ctoken;
                this.cookies.EGG_SESS_ICONFONT = eggSessIconfont;
            }
            else {
                yield this.initBrowser();
                this.listenPageChange();
                this.login();
            }
        });
    }
    listenPageChange() {
        this.page.on('response', (response) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const url = response.url();
            const [resolve] = (_a = this.eventList.get(url)) !== null && _a !== void 0 ? _a : [];
            if (typeof resolve === 'function')
                resolve(response);
        }));
    }
    onPageChange(url) {
        return new Promise((resolve, reject) => {
            this.eventList.set(url, [resolve, reject]);
        });
    }
    getIconInfo() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.iconInfo)
                return this.iconInfo;
            try {
                const { ctoken, EGG_SESS_ICONFONT } = this.cookies;
                if (!ctoken && !EGG_SESS_ICONFONT) {
                    const response = yield this.onPageChange(LOGIN_API);
                    yield this.loginSuccess(response);
                }
                // 获取图标信息
                this.iconInfo = yield this.getProjectDetail();
                yield ((_a = this.browser) === null || _a === void 0 ? void 0 : _a.close());
                return this.iconInfo;
            }
            catch (error) {
                yield ((_b = this.browser) === null || _b === void 0 ? void 0 : _b.close());
                return Promise.reject(error);
            }
        });
    }
    getChromePath() {
        return chromePaths.chrome || getEdgePath();
    }
    initBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            const chromePath = this.getChromePath();
            this.browser = yield puppeteer_core_1.default.launch({ executablePath: chromePath });
            this.page = yield this.browser.newPage();
        });
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password } = this;
                if (!username || !password)
                    throw new Error('账号或密码不存在');
                yield this.page.goto(LOGIN_URL);
                log_1.default.info('进入登录页面');
                yield this.page.waitForSelector('#userid').then(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.page.type('#userid', username);
                    yield this.page.type('#password', password);
                    yield this.page.keyboard.press('Enter');
                    this.checkForm();
                }));
            }
            catch (e) {
                console.error(e);
                yield this.browser.close();
            }
        });
    }
    loginSuccess(response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (response.status() === 200) {
                // 处理登录失败
                yield this.handleLoginError(response);
                // 获取cookie
                yield this.getCookie();
                log_1.default.success('iconfont 登录成功');
            }
            else {
                throw new Error(`登录失败[code=${response.status()}]`);
            }
        });
    }
    createFontInfo(cookie) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ctoken } = this.cookies;
                const { data } = yield axios_1.default.post(CREATE_CDN, qs_1.default.stringify({ t: Date.now(), pid: this.projectId, ctoken }), {
                    headers: {
                        cookie,
                        'x-csrf-token': ctoken,
                        'content-type': `application/x-www-form-urlencoded; charset=UTF-8`
                    }
                });
                const { code, data: _data = {}, message } = data;
                if (code === 200) {
                    const { css_font_face_src } = _data;
                    const [, baseUrl] = css_font_face_src.match(/url\('([\s\S]*)\.woff2/);
                    const woff2_file = `${baseUrl}.woff2`;
                    const woff_file = `${baseUrl}.woff`;
                    const ttf_file = `${baseUrl}.ttf`;
                    const js_file = `${baseUrl}.js`;
                    const css_file = `${baseUrl}.css`;
                    const json_file = `${baseUrl}.json`;
                    Object.assign(_data, { woff2_file, woff_file, ttf_file, js_file, css_file, json_file });
                    return _data;
                }
                throw new Error(message || '创建图标信息失败');
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    // 登录表单验证
    checkForm() {
        return __awaiter(this, void 0, void 0, function* () {
            const useridErrorLabel = yield this.page.$('#userid-error');
            const passwordErrorLabel = yield this.page.$('#password-error');
            let useridErrText = null;
            let passwordErrText = null;
            if (useridErrorLabel) {
                useridErrText = yield this.page.$eval('#userid-error', el => el.textContent);
            }
            if (passwordErrorLabel) {
                passwordErrText = yield this.page.$eval('#password-error', el => el.textContent);
            }
            useridErrText && log_1.default.error(`username：${useridErrText}`);
            passwordErrText && log_1.default.error(`password：${passwordErrText}`);
            if (useridErrText || passwordErrText)
                yield this.browser.close();
        });
    }
    getProjectDetail() {
        return __awaiter(this, void 0, void 0, function* () {
            const { ctoken, EGG_SESS_ICONFONT } = this.cookies;
            const url = `${PROJECT_DETAIL}?pid=${this.projectId}&t=${Date.now()}&ctoken=${ctoken}`;
            const cookie = `EGG_SESS_ICONFONT=${EGG_SESS_ICONFONT};ctoken=${ctoken};`;
            try {
                const { data } = yield axios_1.default.get(url, { headers: { cookie } });
                const { font, project } = data.data;
                // 没有生成图标信息
                if (font === null || project.font_is_old === 1) {
                    return yield this.createFontInfo(cookie);
                }
                return font;
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    // 处理登录报错
    handleLoginError(response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const json = yield response.json();
                if (json.code !== 200) {
                    log_1.default.error(`iconfont 登录失败：${JSON.stringify(json)}`);
                    yield this.browser.close();
                }
            }
            catch (e) {
                // 登录成功没有返回响应实体，会导致报错，如果登录成功，跳过这个报错。
                const loginSuccessErrMsg = 'ProtocolError: Could not load body for this request. This might happen if the request is a preflight request.';
                if (`${e}` !== loginSuccessErrMsg) {
                    yield this.browser.close();
                    throw new Error('error');
                }
            }
        });
    }
    getCookie() {
        return __awaiter(this, void 0, void 0, function* () {
            const cookies = yield this.page.cookies();
            cookies.forEach(item => (this.cookies[item.name] = item.value));
        });
    }
}
exports.default = IconFont;
