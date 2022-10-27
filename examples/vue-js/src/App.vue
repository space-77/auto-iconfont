<template>
  <div id="app">
    <main>
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
      3、路径：src/mian.ts
        - 配置 vue 的 mixin，在绑定元素时输入 icon. 有对应的图标提示，同时也能应用对应的图标名字
     -->
    </main>
  </div>
</template>

<script>
import IconSvg from "./components/icons/IconSvg.vue";
import IconFont from "./components/icons/IconFont.vue";

export default {
  components: {
    IconSvg,
    IconFont,
  },
};
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
