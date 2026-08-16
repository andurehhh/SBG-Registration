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
        'sbg-muted': 'var(--muted)',
        'sbg-line': 'var(--line)',
        'sbg-card': 'var(--card)',
        'sbg-blue': 'var(--blue)',
        'sbg-accent': 'var(--blue)',
        'sbg-accent-dim': 'color-mix(in srgb, var(--blue) 12%, transparent)',
        'sbg-blue-dim': 'color-mix(in srgb, var(--blue) 12%, transparent)',
        'sbg-orange': 'var(--orange)',
        'sbg-text-secondary': 'var(--muted)',
        'sbg-text-muted': 'var(--muted)',
        'sbg-black': 'var(--bg)',
        'sbg-surface': 'var(--card)',
        'sbg-surface-raised': 'var(--card)',
      },
      fontFamily: {
        sans: ['"IBM Plex Mono"', 'monospace'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
