import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import icons from './assets/iconfont'

const app = createApp(App)
app.mixin({
  computed: {
    icon: () => icons
  }
})

app.mount('#app')
