import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import store, { vuexStoreKey } from './store'
import i18n from './i18n'
import './style/index.css'
import { importElementPlus } from './element-plus'

const app = createApp(App)

app
  .use(store, vuexStoreKey)
  .use(i18n)
  .use(router)

importElementPlus(app)

app.mount('#app')
