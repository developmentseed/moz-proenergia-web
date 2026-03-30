import i18n from '@/i18n/instance';

export function registerI18nResource(
  keyPrefix: string,
  fields: Record<string, { en: string; pt?: string }>
) {
  for (const [field, values] of Object.entries(fields)) {
    i18n.addResource('en', 'translation', `${keyPrefix}.${field}`, values.en);
    if (values.pt) {
      i18n.addResource('pt', 'translation', `${keyPrefix}.${field}`, values.pt);
    }
  }
}
