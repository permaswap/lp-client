import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import store, { vuexStoreKey } from './store'
import i18n from './i18n'
import './index.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

createApp(App)
  .use(store, vuexStoreKey)
  .use(i18n)
  .use(router)
  .use(ElementPlus)
  .mount('#app')
