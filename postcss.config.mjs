export default {
  plugins: {
    '@tailwindcss/postcss': {
      // Prevent generation of lab() color functions for html2canvas compatibility
      // Force use of sRGB color space instead
      colorSpace: 'srgb',
    },
    autoprefixer: {},
  },
};