/** Design tokens from docs/ui-design.md. Don't hard-code hex values in screens. */
const { sky, hill, ...colors } = require('./theme').colors;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily: {
        display: ['Poppins_600SemiBold'],
        body: ['OpenSans_400Regular'],
        'body-medium': ['OpenSans_500Medium'],
        'body-semibold': ['OpenSans_600SemiBold'],
      },
      borderRadius: { input: '10px', button: '14px', card: '16px', hero: '24px' },
    },
  },
  plugins: [],
};
