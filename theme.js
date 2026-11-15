// Design tokens from docs/ui-design.md, shared by tailwind.config.js and by code that needs a raw colour (icons, gradients).
const colors = {
  ground: '#F7F6FA',
  card: '#FFFFFF',
  mist: '#ECEAF3',
  line: '#E0DDEA',
  ink: { DEFAULT: '#2B2140', 2: '#5E5873', 3: '#8D88A0' },
  brand: { DEFAULT: '#3C285F', soft: '#5A4388', tint: '#E9E4F3' },
  accent: { DEFAULT: '#7677F4', deep: '#4F50C9', tint: '#E6E6FD', wash: '#F3F3FE' },
  sun: { DEFAULT: '#F17225', core: '#FBB040', deep: '#B8500F', tint: '#FDE8D8' },
  green: { DEFAULT: '#67A20B', strong: '#4C7A08', deep: '#436B07', tint: '#EFF5E5' },
  clay: { DEFAULT: '#B3402A', tint: '#FBE9E4' },
  sky: ['#F3F3FE', '#E7E0F7', '#FBDCC4'],
  hill: '#8E7DB8',
};
module.exports = { colors };
