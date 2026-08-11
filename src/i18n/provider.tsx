'use client';

import { type ReactNode, Suspense, useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { useQueryState } from 'nuqs';
import { langParser, type Language } from './query';
import i18n from './config';

function HtmlLangSync() {
  const { i18n } = useTranslation();
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  return null;
}

// Applies a `lang` param found in the URL (shared/deep links), and makes sure a
// page reached without one (e.g. a fresh visit, or navigation that dropped it)
// picks up the current language.
function LangUrlSync() {
  const { i18n } = useTranslation();
  const currentLang: Language = i18n.language?.startsWith('pt') ? 'pt' : 'en';

  const [urlLang, setUrlLang] = useQueryState(
    'lang',
    langParser.withOptions({ history: 'replace', shallow: true }),
  );

  useEffect(() => {
    if (urlLang && urlLang !== currentLang) {
      i18n.changeLanguage(urlLang);
    } else if (!urlLang) {
      setUrlLang(currentLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlLang]);

  return null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={null}>
        <LangUrlSync />
      </Suspense>
      <HtmlLangSync />
      {children}
    </I18nextProvider>
  );
}
