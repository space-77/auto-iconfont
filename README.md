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

### 配置iconfont信息

```json
# 在 package.json 文件添加配置信息
{
  // ...
  "autoIconfont": {
    "url": "xxx",
    "outDir": "xxx",
    "language": "xxx",
    "username": "xxx",
    "password": "xxx",
    "projectId": "xxx"
  }
  // ...
}
```

### 配置说明

#### 项目 js 地址

- 参数：`url`
- 必传：`和 username、password、projectId 两者选其一`
- 类型：String
- 默认：`-`
- 说明：
  1.  图标项目 Symbol 页签下的 js 链接地址，如： `//at.alicdn.com/t/c/font_xxx_xxx.js`。
  2.  和用户名密码方式对比优点，可以不配置个人账号信息。
  3.  和用户名密码方式对比缺点，每次更新图标都要手动更新 url 链接地址。

#### 项目信息

- 参数：`username、password、projectId`
- 必传：`和 url 两者选其一`
- 类型：String
- 默认：`-`
- 说明：
  1.  配置 iconfont 的项目信息，用户名、密码 和 需要管理的项目 ID。
  2.  和 url 方式对比优点，更新图标后直接执行命令即可，不用手动更新链接地址。
  3.  和 url 方式对比缺点，需要配置个人账号信息。

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

### 运行

```shell
npm run icon-build

# or
yarn icon-build

# or
pnpm icon-build
```
