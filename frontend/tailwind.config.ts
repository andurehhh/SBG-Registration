import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'sbg-black': '#0f1117',
        'sbg-navy': '#1a1f2e',
        'sbg-navy-light': '#252b3b',
        'sbg-purple': '#7C3AED',
        'sbg-purple-light': '#8B5CF6',
        'sbg-purple-muted': '#3b2f6e',
        'sbg-orange': '#FF9900',
        'sbg-white': '#FFFFFF',
        'sbg-gray': '#F2F3F3',
        'sbg-text': '#E2E8F0',
        'sbg-text-muted': '#94A3B8',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
}

export default config
