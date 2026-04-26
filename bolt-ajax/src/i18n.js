import { createI18n } from 'vue-i18n'
import hu from './locales/hu.json'
import en from './locales/en.json'

const i18n = createI18n({
  legacy: false, // Vue 3 Composition API támogatás
  locale: 'hu', // Alapértelmezett nyelv
  fallbackLocale: 'en',
  messages: {
    hu,
    en
  }
})

export default i18n
