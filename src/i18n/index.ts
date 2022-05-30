import { savedI18nStorageKey } from '@/constants'
import { createI18n } from 'vue-i18n'
import en from './en'
import zh from './zh'

const messages = {
  zh,
  en
}

let lang = 'en';

['zh', 'en', 'fr', 'es', 'zh-TW'].forEach(item => {
  if (window.localStorage.getItem(savedI18nStorageKey) === item) {
    lang = item
  }
})

// 通过选项创建 VueI18n 实例
export default createI18n({
  locale: lang, // 设置地区
  messages // 设置地区信息
})
