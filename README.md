<div align="center">

# 自动获取 iconfont 相关资源并下载到本地

</div>

## 快速开始

### 安装

```shell
npm i -D auto-iconfont

# or
yarn add -D auto-iconfont

# or
pnpm add -D auto-iconfont
```

安装后需要在 package.json 添加以下脚本命令

```json
{
  "scripts": {
    "icon-build": "auto-icon build"
  }
}
```

### 配置 iconfont 信息

```javascript
// 在 package.json 文件添加配置信息
{
  // ...
  "autoIconfont": {

    // 用户认证信息方式获取数据 【方式一】
    "ctoken": "xxx",
    "EGG_SESS_ICONFONT": "xxx",

    // 项目 js 地址方式获取数据 【方式二】
    "url": "xxx",

   // 用户账号信息配置文件地址，用户账号密码方式获取数据 【方式三】
    "userInfoPath": "xxx",

    // 项目ID
    "projectId": "xxx",
    // 文件输出位置，默认值 ./src/assets/iconfont
    "outDir": "xxx",
    // 生成 js 还是 ts 的代码，默认值 js
    "language": "xxx"
  }
  // ...
}
```

### 获取数据方式参数说明

> 获取 iconfont 项目信息数据方式配置，共有三种方式获取数据，各种方式有不用的优缺点，选择一个适合自己的即可。

<table>
  <tbody>
    <tr>
      <td data-col="0">配置方式</td>
      <td data-col="1">配置参数</td>
      <td data-col="2">必选</td>
      <td data-col="3">优缺点</td>
      <td data-col="4">获取方式</td>
    </tr>
    <tr>
      <td data-col="0">用户token</td>
      <td data-col="1">ctoken、EGG_SESS_ICONFONT</td>
      <td rowspan="3" data-col="2" style="vertical-align: middle">三选其一</td>
      <td data-col="3">认证信息过期后需要重新获取</td>
      <td data-col="4">登录 iconfont.cn 后，在 cookies 里查找对应字段</td>
    </tr>
    <tr>
      <td data-col="0">项目 js 地址</td>
      <td data-col="1">url</td>
      <td data-col="3">
        项目图标有修改（增删改）需要重新获取链接地址
      </td>
      <td data-col="4">
        登录 iconfont.cn 后，资源管理 - 我的项目 - Symbol 页签下的
        链接，如：//at.alicdn.com/t/c/xx.js
      </td>
    </tr>
    <tr>
      <td data-col="0">用户账号信息</td>
      <td data-col="1">userInfoPath</td>
      <td data-col="3">每个开发者都需要配置自己的账号</td>
      <td data-col="4">创建一个JSON文件（如：userInfo.json），内容是iconfont的登录账号秘密，如： { "username": "your username", "password": "your password" }，然后把文件的地址填到该配置项里，如："userInfoPath": "./userInfo.json"。最后可以把账号文件添加到 .gitignore 里，以免把账号信息提交到项目上。</td>
    </tr>
  </tbody>
</table>

### 其它配置参数说明说明

#### 生成文件类型

- 参数：`projectId`
- 必传：`用户token 和 用户账号信息 方式必传`
- 类型：String | Number
- 默认：`-`
- 说明：项目 ID。

#### 生成文件类型

- 参数：`language`
- 必传：`否`
- 类型：'js' | 'ts'
- 默认：`js`
- 说明：生成 js 还是 ts 的代码。

#### 生成文件保存位置

- 参数：`outDir`
- 必传：`否`
- 类型：String
- 默认：`./src/assets/iconfont`
- 说明：生成文件存放位置

## 运行

```shell
npm run icon-build

# or
yarn icon-build

# or
pnpm icon-build
```

## 生成文件说明

<table>
  <tbody>
    <tr>
      <td>文件名</td>
      <td>说明</td>
    </tr>
    <tr>
      <td>index.ts / index.js</td>
      <td>入口文件，用于在项目引入icon资源，里面包含了项目上有什么icon以及每个icon的说明等信息，有助于编辑器友好提示。</td>
    </tr>
    <tr>
      <td>iconfont.js</td>
      <td>svg 的集合</td>
    </tr>
    <tr>
      <td>iconfont.css</td>
      <td>unicode 引用文件，和线上的差不多，只不过删减没必要的文件，并且把字体引用方式改为本地文件</td>
    </tr>
    <tr>
      <td>iconfont.ttf</td>
      <td>字体文件本地化</td>
    </tr>
    <tr>
      <td>index.d.ts</td>
      <td>在 language 为 js 模式下，会生成入口文件的 ts 声明文件，在js项目，有助于编辑器提示，有什么icon以及icon的说明</td>
    </tr>
  </tbody>
</table>

## 使用

### 引入

把生成文件目录下的 `index.js` 或 `index.ts` 文件在项目入口文件引入即可，

```js
// main.js
import icons from '@/assets/iconfont'
```

如果是 Vue 项目（js 及 ts），可以把 icons 混入到 Vue 原型，然后再把类型提示加上，这样编辑器能提示，使用起来更方便，参考文章 [ts类型扩展功能到 Vue 原型(this)上](https://www.jianshu.com/p/ecc240dd746d)

### 使用

后续使用，请参考 [iconfont 使用帮助](https://www.iconfont.cn/help/detail?helptype=code)
