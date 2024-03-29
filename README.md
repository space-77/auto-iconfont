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
## 运行

```shell
npm run icon-build

# or
yarn icon-build

# or
pnpm icon-build
```

## 使用效果
### 生成文件效果
!['renderings.png'](https://s1.ax1x.com/2022/10/27/xhENlR.png)
### 配合 vscode 插件 Iconify IntelliSense 使用效果
!['renderings-iconify.png'](https://s1.ax1x.com/2022/10/27/xhA2ZT.png)
[查看例子](https://github.com/space-77/auto-iconfont/tree/master/examples)
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
    "language": "xxx",
    // 修改 .iconfont 的样式
    "fontFamilyClass": {
      // 替换 .iconfont， 如 [class*='icon-'],[class^='icon-']
      "className": "xxx",
      "values": {
        // css 样式
        // "color": "red" // 新增 样式
        // "font-size": "1.6rem" // 修改 font-size 的值
        // "font-size": null // 删除 font-size 样式
      }
    },

    // v1.3.0 版本及以上有效
    // 添加 vscode 插件 Iconify IntelliSense 的显示【在编辑器显示使用的icon效果】
    "iconify": {
      // 是否生成 iconify 文件，默认关闭（false）
      "enable": false,
      // icon 前缀，默认使用iconfont项目设置里的前缀
      "prefix": "xx"
    },
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

#### 修改 css 文件的 .iconfont 样式

- 参数：`fontFamilyClass`
- 必传：`否`
- 类型：Object
- 默认：`-`
- 说明：
   - 修改 css 文件的 `.iconfont` 样式
   - `fontFamilyClass.className` 替换 `.iconfont` 位置，可以自定义class，如：`[class*='icon-'],[class^='icon-']`
   - `fontFamilyClass.values.xxx`， 增删改 `.iconfont` 里的样式
   - eg: ``` "fontFamilyClass": {
      "className": "[class*='icon-'],[class^='icon-']",
      "values": {
        "color": "red",
        "font-size": null
      }
    } ```
#### 生成 Iconify IntelliSense 配置信息

- 参数：`iconify`
- 必传：`否`
- 类型：Object
- 默认：`-`
- 说明：
   - v1.3.0 版本及以上有效。
   - 添加 `vscode` 插件 `Iconify IntelliSense` 的显示【在编辑器显示使用的icon效果】
   - `iconify.enable`，是否开启，默认关闭。
   - `iconify.prefix`，icon 前缀，默认使用iconfont项目设置里的前缀。
- 使用：
   - 在 `vscode` 安装 [Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify) 插件。
   - 运行脚本后 `outDir`目录下会生成一个 `iconifyJson.json` 文件。
   - 在项目根目录新建`.vscode`文件夹，文件里新建`settings.json`文件【已有可以忽略】
   - 在 `settings.json` 文件里，把添加 `iconifyJson.json`文件的路径, 添加到 `iconify.customCollectionJsonPaths`里面，参考 [vscode-iconify](https://github.com/antfu/vscode-iconify/blob/main/test/fixture/.vscode/settings.json)。注: `settings.json` 文件里 `iconify.delimiters`是`prefix`和图标名字之间的分隔符。
   - 使用 `prefix` + `delimiters` + `iconName`, eg：参考[官方例子](https://github.com/antfu/vscode-iconify/blob/main/test/fixture/index.html#L8)。
   - 修改 `iconifyJson.json` 文件，需要重启 `vscode`才生效。
![setting.png](https://s1.ax1x.com/2022/10/26/xWANrT.png)
![result.png](https://s1.ax1x.com/2022/10/26/xWAfde.png)

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
    <tr>
      <td>iconifyJson.json</td>
      <td>iconify 插件配置文件</td>
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
