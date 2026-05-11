import { useTranslation } from 'react-i18next';

export function useLocalize() {
  const { i18n } = useTranslation();
  return (en: string, pt?: string | null): string =>
    i18n.language === 'pt' ? (pt || en) : en;
}
