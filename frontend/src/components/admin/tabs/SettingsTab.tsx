import { useEffect, useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { fetchAppSettings, updateAppSettings } from '../../../lib/api'
import type { AppSettings } from '../../../types'

export function SettingsTab() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAppSettings()
      setSettings(data)
    } catch {
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleCor() {
    if (!settings) return
    setSaving(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const updated = await updateAppSettings({ cor_required: !settings.cor_required })
      setSettings(updated)
      setSuccessMsg(
        updated.cor_required
          ? 'COR upload is now required for registration.'
          : 'COR upload is now optional for registration.'
      )
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch {
      setError('Failed to update setting. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--clr-accent)' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-mono text-white text-2xl font-bold">Settings</h1>
        <p className="text-sbg-text-muted text-sm mt-1">
          Manage registration requirements and portal configuration.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-900/20 border border-red-700/50 text-sm text-red-400 font-mono">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded bg-green-900/20 border border-green-700/50 text-sm text-green-400 font-mono">
          {successMsg}
        </div>
      )}

      {/* Registration Requirements Section */}
      <div className="rounded bg-sbg-surface border border-white/[0.06] p-6">
        <h2 className="font-mono text-white text-lg font-bold mb-4">Registration Requirements</h2>

        {/* COR Toggle */}
        <div className="flex items-center justify-between gap-4 py-4 border-b border-white/[0.04] last:border-b-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded bg-white/5 border border-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-4 h-4" style={{ color: 'var(--clr-accent)' }} />
            </div>
            <div>
              <p className="text-white text-sm font-mono font-bold">
                Certificate of Registration (COR)
              </p>
              <p className="text-sbg-text-muted text-xs mt-0.5">
                When enabled, students must upload their COR during registration.
                Disable this if students don't have their COR yet.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={settings?.cor_required ?? false}
            aria-label="Toggle COR requirement"
            disabled={saving}
            onClick={handleToggleCor}
            className={[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0',
              settings?.cor_required
                ? 'bg-sbg-purple'
                : 'bg-white/10 border border-white/[0.12]',
              saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            <span
              className={[
                'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                settings?.cor_required ? 'translate-x-6' : 'translate-x-1',
              ].join(' ')}
            />
          </button>
        </div>

        {/* Status indicator */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className={[
              'inline-block w-2 h-2 rounded-full',
              settings?.cor_required ? 'bg-green-400' : 'bg-yellow-400',
            ].join(' ')}
          />
          <span className="text-xs text-sbg-text-muted font-mono">
            COR upload is currently{' '}
            <span className={settings?.cor_required ? 'text-green-400' : 'text-yellow-400'}>
              {settings?.cor_required ? 'required' : 'optional'}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
