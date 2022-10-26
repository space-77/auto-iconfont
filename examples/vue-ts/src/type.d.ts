export {}
declare module 'vue' {
  interface ComponentCustomProperties {
    icons: typeof import('./assets/iconfont')['default']
  }
}