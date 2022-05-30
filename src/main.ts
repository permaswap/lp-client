import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import i18n from './i18n'
import './index.css'

createApp(App)
  .use(i18n)
  .use(router)
  .mount('#app')
