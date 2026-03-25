/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': '#F8FBF8',
        'app-primary': '#4B7C4B',
        'app-primary-hover': '#3D663D',
        'app-text': '#1E293B',
        'app-text-muted': '#64748B',
        'app-border': '#E2E8F0',
        'app-accent': '#FF9571',
      },
    },
  },
  safelist: [
    {
      pattern: /^(bg|text|border|ring)-\[#([0-9a-fA-F]{3,6})\]$/,
    },
    {
      pattern: /^(bg|text|border|ring)-\[#([0-9a-fA-F]{3,6})\]$/,
      variants: ['hover', 'focus', 'active'],
    },
  ],
  plugins: [],
}

