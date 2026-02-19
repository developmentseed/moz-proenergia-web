'use client';

import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('pt') ? 'pt' : 'en';
  const nextLang = currentLang === 'pt' ? 'en' : 'pt';

  return (
    <Button
      variant="plain"
      padding={0}
      pl={1}
      pr={1}
      fontSize="sm"
      fontWeight="medium"
      fontFamily="body"
      color="fg.muted"
      minW="auto"
      onClick={() => i18n.changeLanguage(nextLang)}
      aria-label={`Switch to ${nextLang.toUpperCase()}`}
    >
      {currentLang.toUpperCase()}
    </Button>
  );
};
