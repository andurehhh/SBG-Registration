import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { RegistrationForm } from '../components/registration/RegistrationForm'
import { RenewalForm } from '../components/registration/RenewalForm'

type FormTab = 'new' | 'returning'

function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark')
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(document.documentElement.getAttribute('data-theme') || 'dark'))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])
  return (
    <button onClick={() => { const n = theme === 'light' ? 'dark' : 'light'; document.documentElement.setAttribute('data-theme', n); localStorage.setItem('sbg-theme', n) }}
      className="theme-btn" aria-label="Toggle theme">
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
const SunIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
const MoonIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<FormTab>('new')
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-screen">

      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <img src="/sbg-logo-white.svg" alt="" className="w-6 h-6" />
            <span className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--text)' }}>SBG</span>
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => navigate('/')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-12 gap-0 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>

          {/* Left: Info */}
          <div className="lg:col-span-5 p-8 lg:p-10" style={{ background: 'var(--bg-raised)', borderRight: '1px solid var(--border)' }}>
            <p className="text-sm font-medium mb-4" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Registration</p>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight" style={{ color: 'var(--text)' }}>
              Join the Builder Community
            </h1>
            <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Apply for SBG membership and get your official digital membership ID card. Build, learn, and grow with AWS.
            </p>
            <ul className="space-y-3 mt-8">
              {[
                'Official digital membership ID card',
                'Access to AWS learning resources',
                'Community events and workshops',
                'Builder network at PUP Binan',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-12 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Powered by AWS. PUP Binan Campus.</p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-7 p-8 lg:p-10">
            {/* Tabs */}
            <div className="flex mb-8 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className="flex-1 px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: activeTab === 'new' ? 'var(--accent)' : 'transparent',
                  color: activeTab === 'new' ? '#09090b' : 'var(--text-secondary)',
                }}
              >
                New Member
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('returning')}
                className="flex-1 px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: activeTab === 'returning' ? 'var(--accent)' : 'transparent',
                  color: activeTab === 'returning' ? '#09090b' : 'var(--text-secondary)',
                }}
              >
                Returning Member
              </button>
            </div>

            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>
              {activeTab === 'new' ? 'Create your application' : 'Renew your membership'}
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'new'
                ? 'Fill out all three steps to complete your membership application.'
                : 'Enter your SBG ID and upload your updated documents.'}
            </p>

            {activeTab === 'new' ? <RegistrationForm /> : <RenewalForm />}
          </div>

        </div>
      </div>
    </div>
  )
}
