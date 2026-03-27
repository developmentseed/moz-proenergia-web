import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import i18next from './instance';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
    react: {
      bindI18nStore: 'added',
    },
  });

// Default to Portuguese when no language preference is stored
if (typeof window !== 'undefined' && !localStorage.getItem('language')) {
  i18next.changeLanguage('pt');
}

export default i18next;
