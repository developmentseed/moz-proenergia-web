import { createSerializer, parseAsStringLiteral } from 'nuqs/server';

export const languages = ['en', 'pt'] as const;
export type Language = (typeof languages)[number];

export const langParser = parseAsStringLiteral(languages).withDefault(languages[1]);

export const serializeLang = createSerializer({ lang: langParser });
