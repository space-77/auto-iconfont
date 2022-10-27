export {}
declare module 'vue' {
  interface ComponentCustomProperties {
    icon: Record<string, string>
  }
}