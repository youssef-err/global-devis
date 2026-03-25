const requiredEnvVars = [];

const optional = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const missing = requiredEnvVars.filter((name) => {
  const value = process.env[name];
  return !value || !value.trim();
});

if (missing.length > 0) {
  console.error(
    [
      'Missing required environment variables for production build:',
      ...missing.map((name) => `- ${name}`),
      '',
      'Set them in Vercel Project Settings -> Environment Variables before deploying.'
    ].join('\n')
  );

  process.exit(1);
}

// Warn if optional Supabase vars are missing (they still work in dev mode)
const missingOptional = optional.filter((name) => {
  const value = process.env[name];
  return !value || !value.trim();
});

if (missingOptional.length > 0) {
  console.warn(
    [
      'Optional environment variables not set (app will work in local mode):',
      ...missingOptional.map((name) => `- ${name}`),
      '',
      'Cloud sync features will be disabled without these vars.'
    ].join('\n')
  );
}

console.log('Environment check passed.');
