import i18next from 'i18next';
import en from './locales/en.json';
import pt from './locales/pt.json';

i18next.init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
  },
  fallbackLng: 'en',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
