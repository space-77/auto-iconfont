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

    // 用户认证信息方式获取数据
    "ctoken": "xxx",
    "EGG_SESS_ICONFONT": "xxx",

    // 项目 js 地址方式获取数据
    "url": "xxx",

   // 用户账号信息配置文件地址
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

> 获取 iconfont 项目信息数据方式配置，共有三种方式获取数据，各种方式有不用的优缺点，选择一个适合自己的即可，多人项目 推荐使用 “用户 token” 方式，个人项目推荐使用 “用户账号信息” 方式

<table>
  <colgroup>
    <col width="143" />
    <col width="181" />
    <col width="89" />
    <col width="232" />
    <col width="261" />
  </colgroup>
  <tbody>
    <tr>
      <td data-col="0">配置方式</td>
      <td data-col="1">配置方式</td>
      <td data-col="2">必选</td>
      <td data-col="3">优缺点</td>
      <td data-col="4">获取方式</td>
    </tr>
    <tr>
      <td data-col="0">用户token</td>
      <td data-col="1">ctoken、EGG_SESS_ICONFONT</td>
      <td rowspan="3" data-col="2" style="vertical-align: middle">三选其一</td>
      <td data-col="3">认证信息过去后需要重新获取</td>
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
      <td data-col="4">创建一个JSON文件（如：userInfo.json），内容是iconfont的登录账号秘密，如： { "username": "your username", "password": "your password" }，然后把该文件的地址填到该配置项里，如："userInfoPath": "./userInfo.json"。最后可以把账号文件添加到 .gitignore 里，以免把账号信息提交到项目上。</td>
    </tr>
  </tbody>
</table>

### 其它配置参数说明说明

#### 生成文件类型

- 参数：`projectId`
- 必传：`用户token 和 用户账号信息 方式必传`
- 类型：String | Number
- 默认：`-`
- 说明：项目ID。

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
