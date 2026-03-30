import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeMessages(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const current = merged[key];

    merged[key] =
      isPlainObject(current) && isPlainObject(value)
        ? mergeMessages(current, value)
        : value;
  }

  return merged;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = (routing.locales.includes(requestedLocale as (typeof routing.locales)[number])
    ? requestedLocale
    : routing.defaultLocale) as (typeof routing.locales)[number];

  // Dynamic import: only load the requested locale + English fallback (~25KB instead of ~120KB)
  const en = (await import('../messages/en.json')).default;
  const localeMessages = locale === 'en'
    ? en
    : (await import(`../messages/${locale}.json`)).default;

  const messages =
    locale === 'en'
      ? en
      : mergeMessages(en as Record<string, unknown>, localeMessages as Record<string, unknown>);

  return {
    locale,
    messages
  };
});
