import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'sbg-bg': 'var(--bg)',
        'sbg-text': 'var(--text)',
        'sbg-muted': 'var(--text-secondary)',
        'sbg-text-secondary': 'var(--text-secondary)',
        'sbg-text-muted': 'var(--text-secondary)',
        'sbg-line': 'var(--border)',
        'sbg-card': 'var(--card)',
        'sbg-accent': '#2d9cdb',
        'sbg-accent-dark': '#1a7bb5',
        'sbg-accent-dim': 'rgba(45, 156, 219, 0.1)',
        'sbg-black': '#0f1117',
        'sbg-surface': '#1a1f2e',
        'sbg-surface-raised': '#252b3b',
        // Legacy aliases for admin components
        'sbg-blue': '#2d9cdb',
        'sbg-blue-dim': 'rgba(45, 156, 219, 0.1)',
        'sbg-orange': '#f5a623',
        'sbg-navy': '#1a1f2e',
        'sbg-navy-light': '#252b3b',
        'sbg-purple': '#2d9cdb',
        'sbg-purple-light': '#1a7bb5',
        'sbg-purple-muted': 'rgba(45, 156, 219, 0.15)',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
