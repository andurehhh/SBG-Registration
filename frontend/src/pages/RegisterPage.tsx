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
    <div data-theme="light" style={{ background: 'var(--bg)' }} className="min-h-screen">

      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <img src="/sbg-logo-white.svg" alt="" className="w-6 h-6" />
            <span className="text-xs font-semibold hidden sm:block" style={{ color: 'var(--text)' }}>SBG</span>
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => navigate('/')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              <ArrowLeft size={12} /> Back
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header — lead with the learning outcome */}
        <div className="mb-5">
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Membership Application</p>
          <h1 className="text-lg sm:text-2xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
            Learn cloud computing. Build real projects. Get hired.
          </h1>
          <p className="text-xs sm:text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Join the first tech organization at PUP Biñan. Get hands-on with AWS through workshops, hackathons, and certification pathways. Members also receive an official digital membership ID card.
          </p>
        </div>

        {/* Info block — only shown for new members, before the form */}
        {activeTab === 'new' && (
          <div className="mb-5 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="px-4 py-2.5" style={{ background: 'var(--accent)', color: 'white' }}>
              <p className="text-xs font-bold">Before you apply</p>
            </div>
            <div className="p-4 space-y-3" style={{ background: 'var(--bg-raised)' }}>
              {[
                ['Who can apply', 'Currently enrolled students of PUP Biñan Campus, any year level or course.'],
                ['Deadline', 'Applications close September 14, 2026 at 11:59 PM.'],
                ['Expected slots', 'We\'re welcoming our next batch of builders — apply early, slots are limited.'],
                ['Review timeline', 'Applications are reviewed within 3–5 days. You\'ll be notified by email.'],
                ['Orientation', 'Approved members will be invited to an onboarding orientation. Details sent via email and our Facebook page.'],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col sm:flex-row sm:gap-3">
                  <span className="text-[11px] font-bold shrink-0 sm:w-32" style={{ color: 'var(--text)' }}>{label}</span>
                  <span className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-5 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className="flex-1 px-3 py-2 text-xs sm:text-sm font-medium transition-all"
            style={{
              background: activeTab === 'new' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'new' ? 'white' : 'var(--text-secondary)',
            }}
          >
            New Member
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('returning')}
            className="flex-1 px-3 py-2 text-xs sm:text-sm font-medium transition-all"
            style={{
              background: activeTab === 'returning' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'returning' ? 'white' : 'var(--text-secondary)',
            }}
          >
            Returning Member
          </button>
        </div>

        {/* Sub-heading */}
        <div className="mb-5">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {activeTab === 'new' ? 'Create your application' : 'Renew your membership'}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {activeTab === 'new'
              ? 'Fill out all three steps to complete your membership application.'
              : 'Enter your SBG ID and upload your updated documents.'}
          </p>
        </div>

        {/* Form */}
        {activeTab === 'new' ? <RegistrationForm /> : <RenewalForm />}
      </div>
    </div>
  )
}
