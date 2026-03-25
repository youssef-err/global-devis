import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

import ar from '@/messages/ar.json';
import de from '@/messages/de.json';
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import fr from '@/messages/fr.json';
import it from '@/messages/it.json';
import nl from '@/messages/nl.json';
import pt from '@/messages/pt.json';
import ru from '@/messages/ru.json';
import tr from '@/messages/tr.json';

const messagesByLocale = {
  ar,
  de,
  en,
  es,
  fr,
  it,
  nl,
  pt,
  ru,
  tr
} as const;

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
  const localeMessages = messagesByLocale[locale] as Record<string, unknown>;
  const messages =
    locale === 'en'
      ? en
      : mergeMessages(en as Record<string, unknown>, localeMessages);

  return {
    locale,
    messages
  };
});
