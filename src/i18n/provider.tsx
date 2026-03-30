'use client';

import { type ReactNode, useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './config';

function HtmlLangSync() {
  const { i18n } = useTranslation();
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  return null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <HtmlLangSync />
      {children}
    </I18nextProvider>
  );
}
