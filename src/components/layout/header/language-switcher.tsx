'use client';

import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('pt') ? 'pt' : 'en';
  const nextLang = currentLang === 'pt' ? 'en' : 'pt';
  const currentFlag = currentLang === 'pt' ? '🇲🇿' : '🇬🇧';

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
      onClick={() => i18n.changeLanguage(nextLang)}
      aria-label={`Switch to ${nextLang.toUpperCase()}`}
    >
      {currentFlag}{" "}
      {currentLang.toUpperCase()}
    </Button>
  );
};
