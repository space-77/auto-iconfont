import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import IconFont from './components/IconFont'
import IconSvg from './components/IconSvg'
import icon from './assets/iconfont'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      {/* 
        本项目查看效果
          1、vscode 下载 Iconify IntelliSense 插件
          2、运行 npm run icon-build 命令
          3、重启 vscode      
      */}
      <div>
        <IconSvg name="icon-yangantanceqi" size="50" />
        <IconSvg name="icon-gaojingshuchushebei" size="50" />
        <IconSvg name={icon.hongwaimuqiang} size="50" />
        <IconFont name={icon.zuobiao} size="50" color="red" />
        <IconFont name={icon.yaokongqi} size="50" color="#646cff" />
      </div>
      {/* 
      重要文件配置
        1、路径：.vscode/settings.json
          - customCollectionJsonPaths 配置 iconify 信息
          - delimiters 配置 分隔符
        2、路径：package.json
          - iconify.enable 开启 iconify 生成 Iconify IntelliSense 配置文件（生成 iconifyJson.json 文件）
          - iconify.prefix 前缀，默认使用iconfont项目设置里的前缀（如果项目配置的前缀最后一个字符是非）
      */}

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
