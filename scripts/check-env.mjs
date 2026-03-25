const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

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

console.log('Environment check passed.');
