/** @type {import('tailwindcss').Config} */
export default {
  theme: {},
  corePlugins: {},
  // Prevent Tailwind from generating lab() color functions for html2canvas compatibility
  future: {
    disableColorOpacityUtilityVariants: false,
  },
}
