import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  locales: ['en', 'ar', 'fr', 'es', 'pt', 'de', 'it', 'nl', 'tr', 'ru'],
  defaultLocale: 'en'
});
 
export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);