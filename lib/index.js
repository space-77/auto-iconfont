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
exports.init = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const IconFont_1 = __importDefault(require("./IconFont"));
const utils_1 = require("./utils");
// https://github.com/chenjiezi/iconfont-auto-import
class Config {
    constructor() {
        this.url = '';
        this.outDir = './iconfont';
        this.language = 'js';
    }
    get iconTTFPath() {
        return path_1.default.join(this.outDir, 'iconfont.ttf');
    }
    get iconTTFAddress() {
        return './iconfont.ttf';
    }
    get iconCssPath() {
        return path_1.default.join(this.outDir, 'iconfont.css');
    }
}
const config = new Config();
function downloadFileAsync() {
    return new Promise((resolve, reject) => {
        const filePath = path_1.default.join(config.outDir, 'iconfont.ttf');
        const file = fs_extra_1.default.createWriteStream(filePath);
        https_1.default.get(`${config.url}.ttf`, res => {
            if (res.statusCode !== 200) {
                reject(res.statusCode);
                return;
            }
            res.on('end', () => {
                console.log('download end');
            });
            file
                .on('finish', () => {
                console.log('finish write file');
                file.close(resolve);
            })
                .on('error', err => {
                fs_extra_1.default.unlinkSync(filePath);
                reject(err.message);
            });
            res.pipe(file);
        });
    });
}
function formatUrl(url) {
    url = url.replace(/^(http:)?\/\//, 'https://');
    if (!/^https/.test(url))
        throw new Error('图标地址异常');
    url = url.split('?')[0];
    url = url.slice(0, url.lastIndexOf('.'));
    config.url = url;
}
function formatPath(outDir) {
    outDir = (0, utils_1.getRootFilePath)(outDir);
    fs_extra_1.default.mkdirSync(outDir, { recursive: true });
    config.outDir = outDir;
}
function getIconfontCss() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { data: cssStr } = yield axios_1.default.get(`${config.url}.css`);
            cssStr = cssStr.replace(/src:[\s\S]*'\);/, `src: url('${config.iconTTFAddress}?t=${Date.now()}') format('truetype');`);
            (0, utils_1.createFile)(config.iconCssPath, cssStr);
        }
        catch (error) {
            console.error(error);
        }
    });
}
function getIconJsCode() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield axios_1.default.get(`${config.url}.js`);
            const filePath = path_1.default.join(config.outDir, 'iconfont.js');
            const content = `/* eslint-disable */\r\n${data}`;
            fs_extra_1.default.writeFileSync(filePath, content);
        }
        catch (error) {
            console.error(error);
        }
    });
}
function getIconName() {
    return __awaiter(this, void 0, void 0, function* () {
        const jsonPaht = `${config.url}.json`;
        const { data } = yield axios_1.default.get(jsonPaht);
        const { glyphs, name, description, css_prefix_text } = data;
        let contentFont = `
  import './iconfont'
  import './iconfont.css'

  /**
   * @description ${name}-字体图标名称列表 ${description}
   */
  export default {\r\n`;
        glyphs.forEach(item => {
            const { font_class, name } = item;
            const iconName = font_class.replace(/-/g, '_').toUpperCase();
            const typeVlaue = `'${css_prefix_text}${font_class}'`;
            contentFont += `
    /**
     * @name ${font_class}
     * @description ${name}
     */
    ${iconName}: ${typeVlaue},
    `;
        });
        contentFont += '}';
        const filePath = path_1.default.join(config.outDir, 'index.ts');
        (0, utils_1.createFile)(filePath, contentFont);
        if (config.language === 'js') {
            (0, utils_1.ts2Js)([filePath], true);
            fs_extra_1.default.unlinkSync(filePath);
        }
    });
}
function getConfig() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let { url, ctoken, EGG_SESS_ICONFONT, userInfoPath, projectId, outDir = './src/assets/iconfont', language = 'js' } = (_a = require((0, utils_1.getRootFilePath)('./package.json')).autoIconfont) !== null && _a !== void 0 ? _a : {};
        if (!(0, utils_1.judgeIsVaildUrl)(url)) {
            if (!projectId)
                throw new Error('项目id不存在！');
            if (!userInfoPath && !(EGG_SESS_ICONFONT && ctoken))
                throw new Error('iconfont 地址异常，或者用户信息异常');
            let username;
            let password;
            if (/\.json$/i.test(userInfoPath)) {
                const res = require((0, utils_1.getRootFilePath)(userInfoPath));
                username = res.username;
                password = res.password;
            }
            const iconfont = new IconFont_1.default({ username, password, projectId, eggSessIconfont: EGG_SESS_ICONFONT, ctoken });
            yield iconfont.init();
            const { js_file } = (_b = (yield iconfont.getIconInfo())) !== null && _b !== void 0 ? _b : {};
            url = js_file;
        }
        config.language = language;
        formatUrl(url);
        formatPath(outDir);
        (0, utils_1.loadPrettierConfig)(); // 读取项目 prettier 配置信息
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        yield getConfig(); // 读取 项目配置信息
        getIconName(); // 生成 icon 名称文件
        getIconJsCode(); // 生成 js 代码
        getIconfontCss(); // 生成 css 文件
        downloadFileAsync(); // 下载 字体包
    });
}
exports.init = init;
// init()
//# sourceMappingURL=index.js.map