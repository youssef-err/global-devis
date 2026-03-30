const REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SITE_URL',
];

const OPTIONAL = [
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'NEXT_PUBLIC_ADSENSE_PUB_ID',
  'NEXT_PUBLIC_SENTRY_DSN',
];

// In CI/deployment platforms (GitHub Actions, Vercel, Netlify, etc.)
// env vars are injected by the platform — skip the .env.local check.
if (process.env.CI) {
  console.warn('  ✔ CI environment detected — skipping local env check\n');
  process.exit(0);
}

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('\n  ✖ Missing required environment variables:\n');
  missing.forEach((key) => console.error(`    - ${key}`));
  console.error('\n  Add them to .env.local before building.\n');
  process.exit(1);
}

const missingOptional = OPTIONAL.filter((key) => !process.env[key]);
if (missingOptional.length > 0) {
  console.warn('\n  ⚠ Optional env vars not set (ads/analytics will be disabled):\n');
  missingOptional.forEach((key) => console.warn(`    - ${key}`));
  console.warn('');
}

console.warn('  ✔ Environment variables OK\n');
