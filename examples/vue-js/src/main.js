import Vue from 'vue'
import App from './App.vue'
import icons from './assets/iconfont/index'

import './assets/main.css'

Vue.mixin({
  computed: {
    icon() {
      return icons
    }
  }
})
new Vue({
  render: (h) => h(App)
}).$mount('#app')
