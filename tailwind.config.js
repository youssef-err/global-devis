/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    // Disable lab() color interpolation to use sRGB instead (for Vercel build compatibility)
    colorInterpolation: 'srgb',
  },
  corePlugins: {
    // Ensure no lab color support is generated
  },
};
