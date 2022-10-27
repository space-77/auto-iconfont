<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'
import IconSvg from './components/IconSvg.vue'
import IconFont from './components/IconFont.vue'
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <div>
    <!--
      本项目查看效果
      1、vscode 下载 Iconify IntelliSense 插件
      2、运行 npm run icon-build 命令
      3、重启 vscode
    -->
    <IconSvg name="icon-tianjia3" size="50" />
    <IconSvg name="icon-zuobiao" size="50" />
    <IconSvg :name="'icon-hongwaimuqiang'" size="50" />
    <IconFont :name="icon.zhinengmensuo" color="red" size="50" />
    <IconFont :name="icon.yaokongqi" color="#646cff" size="50" />
    <!--
      重要文件配置
      1、路径：.vscode/settings.json
        - customCollectionJsonPaths 配置 iconify 信息
        - delimiters 配置 分隔符
      2、路径：package.json
        - iconify.enable 开启 iconify 生成 Iconify IntelliSense 配置文件（生成 iconifyJson.json 文件）
        - iconify.prefix 前缀，默认使用iconfont项目设置里的前缀（如果项目配置的前缀最后一个字符是非）
      3、路径：src/type.d.ts 和 src/mian.ts
        - 配置 vue 的 mixin，在绑定元素时输入 icon. 有对应的图标提示，同事也能应用对应的图标
     -->
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
