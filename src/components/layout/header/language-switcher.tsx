'use client';

import { Suspense } from 'react';
import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useQueryState } from 'nuqs';
import { langParser } from '@/i18n/query';

function LanguageSwitcherInner() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('pt') ? 'pt' : 'en';
  const nextLang = currentLang === 'pt' ? 'en' : 'pt';
  const currentFlag = currentLang === 'pt' ? '🇲🇿' : '🇬🇧';

  const [, setLang] = useQueryState(
    'lang',
    langParser.withOptions({ history: 'replace', shallow: true }),
  );

  const handleClick = () => {
    i18n.changeLanguage(nextLang);
    setLang(nextLang);
  };

  return (
    <Button
      variant="plain"
      fontWeight="semibold"
      colorPalette="orange"
      size="sm"
      px={1.5}
      _hover={{ bg: "orange.fg", color: "orange.subtle" }}
      color="inherit"
      minW="auto"
      onClick={handleClick}
      aria-label={`Switch to ${nextLang.toUpperCase()}`}
    >
      {currentFlag}{" "}
      {currentLang.toUpperCase()}
    </Button>
  );
};

export const LanguageSwitcher = () => (
  <Suspense fallback={null}>
    <LanguageSwitcherInner />
  </Suspense>
);
