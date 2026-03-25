import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from '@ducanh2912/next-pwa';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // حذف skipWaiting لأنه قد لا يكون مدعوماً في هذه النسخة
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // إزالة experimental turbo لتجنب تعارض النسخ
};

export default withPWA(withNextIntl(nextConfig));