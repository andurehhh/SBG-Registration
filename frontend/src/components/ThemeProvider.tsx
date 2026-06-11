import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'sbg-theme'

function isValidTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light'
}

function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isValidTheme(stored) ? stored : null
  } catch {
    // localStorage unavailable (private browsing, etc.)
    return null
  }
}

function getSystemPreference(): Theme | null {
  try {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  } catch {
    // matchMedia not supported
  }
  return null
}

function resolveInitialTheme(): Theme {
  // 1. localStorage
  const stored = getStoredTheme()
  if (stored) return stored

  // 2. System preference
  const system = getSystemPreference()
  if (system) return system

  // 3. Default to dark
  return 'dark'
}

function applyThemeToDOM(theme: Theme): void {
  document.documentElement.classList.toggle('light', theme === 'light')
}

function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // localStorage unavailable — silently fail
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme)

  // Sync DOM class on mount and whenever theme changes
  useLayoutEffect(() => {
    applyThemeToDOM(theme)
    persistTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
