import labFunction from 'postcss-lab-function';

export default {
  plugins: [
    '@tailwindcss/postcss',
    labFunction({ preserve: false }),
    'autoprefixer',
  ],
};
