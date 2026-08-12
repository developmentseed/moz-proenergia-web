'use client';

import { type ComponentProps } from 'react';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import { serializeLang, type Language } from '@/i18n/query';

type LocalizedLinkProps = ComponentProps<typeof NextLink>;

// Carries the current `lang` query param forward on page level navigation
export default function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const { i18n } = useTranslation();
  const lang: Language = i18n.language?.startsWith('pt') ? 'pt' : 'en';

  const resolvedHref = typeof href === 'string' ? serializeLang(href, { lang }) : href;

  return <NextLink href={resolvedHref} {...props} />;
}
