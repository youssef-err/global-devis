import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // كيتسنى الـ locale يجي من الـ URL
  let locale = await requestLocale;
 
  // إلا لقى الـ locale ماشي من اللغات المسموحة، كيدير default
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});