import { useTranslation } from 'react-i18next';

export function useLocalize() {
  const { i18n } = useTranslation();
  return (en: string | null, pt?: string | null): string =>
    // Return empty string as a fallback
    (i18n.language === 'pt' && pt)? pt : en ?? '';
}
