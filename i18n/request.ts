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

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = (routing.locales.includes(requestedLocale as (typeof routing.locales)[number])
    ? requestedLocale
    : routing.defaultLocale) as (typeof routing.locales)[number];

  return {
    locale,
    messages: messagesByLocale[locale]
  };
});
