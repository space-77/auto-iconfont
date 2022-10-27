import fs from 'fs'
import path from 'path'
import prettier, { RequiredOptions } from 'prettier'
import { PrettierConfig } from '../config'
// import ts, { ModuleKind, ScriptTarget } from 'typescript'

/**
 * @param str
 * @description 烤串转驼峰
 */
export function camel2Kebab(str: string) {
  return str.replace(/-(\w)/g, (_, $1) => $1.toUpperCase())
}

/**
 * @param str
 * @description 首字母大写
 */
export function firstToUpper(str: string) {
  return str.replace(/^(\S)/g, val => val.toUpperCase())
}

/**
 * @param str
 * @description 首字母小写
 */
export function firstToLower(str: string) {
  return str.replace(/^(\S)/g, val => val.toLocaleLowerCase())
}

/**
 * @param originPath 起始位置
 * @param targetPath 目标位置
 * @description 计算某个路径和另一个路径之间的差值
 */
export function findDiffPath(originPath: string, targetPath: string) {
  const diffPath = path.relative(originPath, targetPath).replace(/\\\\?/g, '/')
  return /^\.\.?\//.test(diffPath) ? diffPath : `./${diffPath}` // 处理同级目录应用异常问题
}

export function getRootFilePath(filePath: string) {
  return path.join(process.cwd(), filePath)
}

/**
 * @param preDirPath
 * @description 获取文件夹路径
 */
export function resolveOutPath(...paths: string[]) {
  return path.join(process.cwd(), ...paths)
}

/**
 * @description 创建文件
 */
export function createFile(filePath: string, content: string, parser: RequiredOptions['parser']) {
  try {
    fs.writeFileSync(filePath, format(content, PrettierConfig.config, parser))
  } catch (error) {
    console.error(error)
    return Promise.reject(error)
  }
}

/**
 * @description 格式化代码
 */
export function format(fileContent: string, prettierOpts = {}, parser: RequiredOptions['parser']) {
  try {
    return prettier.format(fileContent, {
      parser,
      ...prettierOpts
    })
  } catch (e: any) {
    // log.error(`代码格式化报错！${e.toString()}\n代码为：${fileContent}`)
    return fileContent
  }
}

/** 检测是否是合法url */
export function judgeIsVaildUrl(url: string) {
  return /^(https?:)?\/\/.*?$/.test(url)
}

export async function loadPrettierConfig(prettierPath?: string) {
  let filePath: string | undefined
  if (!prettierPath) {
    const fileType = [
      getRootFilePath('./.prettierrc.js'),
      getRootFilePath('./prettier.config.js'),
      getRootFilePath('./prettier.config.cjs'),
      getRootFilePath('./.prettierrc'),
      getRootFilePath('./.prettierrc.json'),
      getRootFilePath('./.prettierrc.json5')
    ]
    filePath = fileType.find(i => fs.existsSync(i))
  } else {
    filePath = getRootFilePath(prettierPath)
  }
  if (!filePath) {
    PrettierConfig.config = require(getRootFilePath('./package.json')).prettier
  } else {
    try {
      // .js .cjs  .json
      if (/\.(c?js|json)$/.test(filePath)) {
        // js
        PrettierConfig.config = require(filePath)
      } else {
        // json
        PrettierConfig.config = JSON.parse(fs.readFileSync(filePath, 'utf8').toString())
      }
    } catch (error) {
      console.error(error)
    }
  }
}

// export function ts2Js(filesNames: string[], declaration: boolean) {
//   const options = {
//     target: ScriptTarget.ESNext,
//     module: ModuleKind.ES2015,
//     declaration,
//     skipLibCheck: true
//   }

//   const host = ts.createCompilerHost(options)
//   host.writeFile = (fileName, content) => {
//     createFile(fileName, content, 'babel')
//   }

//   const program = ts.createProgram(filesNames, options, host)
//   program.emit()
// }

/**
 * @param { Any } val - 校验的数据
 * @description 判断值是否为空值
 */
export function isVoid(val: any): boolean {
  return val === undefined || val === null || Number.isNaN(val)
}

export function findMost(arr: any[]) {
  if (!arr.length) return
  if (arr.length === 1) return 1
  let maxName
  let maxNum = 0
  arr.reduce((res, currentNum) => {
    res[currentNum] ? (res[currentNum] += 1) : (res[currentNum] = 1)
    if (res[currentNum] > maxNum) {
      maxNum = res[currentNum]
      maxName = currentNum
    }
    return res
  }, {})
  return maxName
}
