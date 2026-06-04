import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'uz',
    lng: localStorage.getItem('language') || 'uz',
    supportedLngs: ['uz', 'en', 'ru'],
    backend: {
      loadPath: '/translations/{{lng}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
