"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.isVoid = exports.ts2Js = exports.loadPrettierConfig = exports.judgeIsVaildUrl = exports.format = exports.createFile = exports.resolveOutPath = exports.getRootFilePath = exports.findDiffPath = exports.firstToLower = exports.firstToUpper = exports.camel2Kebab = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prettier_1 = __importDefault(require("prettier"));
const config_1 = require("../config");
const typescript_1 = __importStar(require("typescript"));
/**
 * @param str
 * @description 烤串转驼峰
 */
function camel2Kebab(str) {
    return str.replace(/-(\w)/g, (_, $1) => $1.toUpperCase());
}
exports.camel2Kebab = camel2Kebab;
/**
 * @param str
 * @description 首字母大写
 */
function firstToUpper(str) {
    return str.replace(/^(\S)/g, val => val.toUpperCase());
}
exports.firstToUpper = firstToUpper;
/**
 * @param str
 * @description 首字母小写
 */
function firstToLower(str) {
    return str.replace(/^(\S)/g, val => val.toLocaleLowerCase());
}
exports.firstToLower = firstToLower;
/**
 * @param originPath 起始位置
 * @param targetPath 目标位置
 * @description 计算某个路径和另一个路径之间的差值
 */
function findDiffPath(originPath, targetPath) {
    const diffPath = path_1.default.relative(originPath, targetPath).replace(/\\\\?/g, '/');
    return /^\.\.?\//.test(diffPath) ? diffPath : `./${diffPath}`; // 处理同级目录应用异常问题
}
exports.findDiffPath = findDiffPath;
function getRootFilePath(filePath) {
    return path_1.default.join(process.cwd(), filePath);
}
exports.getRootFilePath = getRootFilePath;
/**
 * @param preDirPath
 * @description 获取文件夹路径
 */
function resolveOutPath(...paths) {
    return path_1.default.join(process.cwd(), ...paths);
}
exports.resolveOutPath = resolveOutPath;
/**
 * @description 创建文件
 */
function createFile(filePath, content, parser) {
    try {
        fs_1.default.writeFileSync(filePath, format(content, config_1.PrettierConfig.config, parser));
    }
    catch (error) {
        console.error(error);
        return Promise.reject(error);
    }
}
exports.createFile = createFile;
/**
 * @description 格式化代码
 */
function format(fileContent, prettierOpts = {}, parser) {
    try {
        return prettier_1.default.format(fileContent, Object.assign({ parser }, prettierOpts));
    }
    catch (e) {
        // log.error(`代码格式化报错！${e.toString()}\n代码为：${fileContent}`)
        return fileContent;
    }
}
exports.format = format;
/** 检测是否是合法url */
function judgeIsVaildUrl(url) {
    return /^(https?:)?\/\/.*?$/.test(url);
}
exports.judgeIsVaildUrl = judgeIsVaildUrl;
function loadPrettierConfig(prettierPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let filePath;
        if (!prettierPath) {
            const fileType = [
                getRootFilePath('./.prettierrc.js'),
                getRootFilePath('./prettier.config.js'),
                getRootFilePath('./prettier.config.cjs'),
                getRootFilePath('./.prettierrc'),
                getRootFilePath('./.prettierrc.json'),
                getRootFilePath('./.prettierrc.json5')
            ];
            filePath = fileType.find(i => fs_1.default.existsSync(i));
        }
        else {
            filePath = getRootFilePath(prettierPath);
        }
        if (!filePath) {
            config_1.PrettierConfig.config = require(getRootFilePath('./package.json')).prettier;
        }
        else {
            try {
                // .js .cjs  .json
                if (/\.(c?js|json)$/.test(filePath)) {
                    // js
                    config_1.PrettierConfig.config = require(filePath);
                }
                else {
                    // json
                    config_1.PrettierConfig.config = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8').toString());
                }
            }
            catch (error) {
                console.error(error);
            }
        }
    });
}
exports.loadPrettierConfig = loadPrettierConfig;
function ts2Js(filesNames, declaration) {
    const options = {
        target: typescript_1.ScriptTarget.ESNext,
        module: typescript_1.ModuleKind.ES2015,
        declaration,
        skipLibCheck: true
    };
    const host = typescript_1.default.createCompilerHost(options);
    host.writeFile = (fileName, content) => {
        createFile(fileName, content, 'babel');
    };
    const program = typescript_1.default.createProgram(filesNames, options, host);
    program.emit();
}
exports.ts2Js = ts2Js;
/**
 * @param { Any } val - 校验的数据
 * @description 判断值是否为空值
 */
function isVoid(val) {
    return val === undefined || val === null || Number.isNaN(val);
}
exports.isVoid = isVoid;
