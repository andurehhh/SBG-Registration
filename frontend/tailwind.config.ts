import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic theme-aware colors (these switch with dark/light mode)
        'sbg-black': 'var(--color-bg)',
        'sbg-navy': 'var(--color-surface)',
        'sbg-navy-light': 'var(--color-surface-raised)',
        'sbg-purple': '#7C3AED',
        'sbg-purple-light': '#8B5CF6',
        'sbg-purple-muted': '#3b2f6e',
        'sbg-orange': '#FF9900',
        'sbg-white': '#FFFFFF',
        'sbg-gray': '#F2F3F3',
        'sbg-text': 'var(--color-text-primary)',
        'sbg-text-muted': 'var(--color-text-secondary)',
        // Additional semantic aliases
        'page': 'var(--color-bg)',
        'surface': 'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        'border-theme': 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
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
