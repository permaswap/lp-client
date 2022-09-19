import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import store, { vuexStoreKey } from './store'
import i18n from './i18n'
import './style/index.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app
  .use(store, vuexStoreKey)
  .use(i18n)
  .use(router)
  .use(ElementPlus)
  .mount('#app')
