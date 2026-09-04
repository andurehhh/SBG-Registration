import { useState, useEffect } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { RegistrationForm } from '../components/registration/RegistrationForm'
import { RenewalForm } from '../components/registration/RenewalForm'

type FormTab = 'new' | 'returning'

// Main marketing site — the logo links here.
const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || '/'

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

const ELIGIBILITY = [
  ['Who can apply', 'Currently enrolled students of PUP Biñan Campus, any year level or course.'],
  ['Deadline', 'Applications close September 14, 2026 at 11:59 PM.'],
  ['Expected slots', "We're welcoming our next batch of builders — apply early, slots are limited."],
  ['Review timeline', "Applications are reviewed within 3–5 days. You'll be notified by email."],
  ['Orientation', 'Approved members will be invited to an onboarding orientation. Details sent via email and our Facebook page.'],
]

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<FormTab>('new')
  const [started, setStarted] = useState(false)
  const [agreed, setAgreed] = useState(false)

  return (
    <div data-theme="light" style={{ background: 'var(--bg)' }} className="min-h-screen">

      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <a href={MARKETING_URL} className="flex items-center gap-2">
            <img src="/sbg-logo-white.svg" alt="" className="w-6 h-6" />
            <span className="text-xs font-semibold hidden sm:block" style={{ color: 'var(--text)' }}>AWS SBG - PUP Biñan</span>
          </a>
          <ThemeToggle />
        </div>
      </nav>

      {/* ── INTRO GATE ── */}
      {!started ? (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Hero */}
          <div className="mb-8">
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Membership Application</p>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight" style={{ color: 'var(--text)' }}>
              Learn cloud computing.<br />Build real projects. Get hired.
            </h1>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Join the first tech organization at PUP Biñan. Get hands-on with AWS through workshops, hackathons, and certification pathways. Members also receive an official digital membership ID card.
            </p>
          </div>

          {/* Before you apply — the focus */}
          <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
            <div className="px-5 py-3.5" style={{ background: 'var(--accent)' }}>
              <h2 className="text-sm font-bold text-white">Before you apply</h2>
            </div>
            <div className="p-5 space-y-4" style={{ background: 'var(--bg-raised)' }}>
              {ELIGIBILITY.map(([label, value]) => (
                <div key={label} className="flex flex-col sm:flex-row sm:gap-4">
                  <span className="text-xs font-bold shrink-0 sm:w-36" style={{ color: 'var(--text)' }}>{label}</span>
                  <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What you'll need */}
          <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>What you'll need</h2>
            </div>
            <div className="p-5 space-y-2.5" style={{ background: 'var(--bg-raised)' }}>
              {[
                'Your student number and PUP webmail',
                'A screenshot proving you shared our recruitment post (required)',
                'Your Certificate of Registration — optional, can be submitted later',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <Check size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                  <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy consent */}
          <div className="rounded-xl p-5 mb-5" style={{ border: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
            <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>Data privacy</h2>
            <p className="text-[11px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              We collect your student number, personal email, PUP webmail, gender, Certificate of Registration, and proof-of-share screenshot solely to review your membership application. This data is accessible only to SBG Core Team officers and is used for verification and communication. Application documents (COR and screenshots) are deleted at the end of each semester.
            </p>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0 cursor-pointer"
                style={{ accentColor: '#2d9cdb' }}
              />
              <span className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>
                I understand and consent to how my data will be collected, used, and stored as described above.
              </span>
            </label>
          </div>

          {/* Start CTA */}
          <button
            onClick={() => setStarted(true)}
            disabled={!agreed}
            className="btn-primary w-full"
            style={{ opacity: agreed ? 1 : 0.5, cursor: agreed ? 'pointer' : 'not-allowed' }}
          >
            Start Application <ArrowRight size={16} />
          </button>
          <p className="text-[11px] text-center mt-3" style={{ color: 'var(--text-secondary)' }}>
            Already a member?{' '}
            <button onClick={() => { setActiveTab('returning'); setStarted(true); setAgreed(true) }} className="font-semibold" style={{ color: 'var(--accent)' }}>
              Renew here
            </button>
          </p>
        </div>
      ) : (
        /* ── FORM ── */
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Back to intro */}
          <button
            onClick={() => setStarted(false)}
            className="text-xs font-medium mb-4 inline-flex items-center gap-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowRight size={12} style={{ transform: 'rotate(180deg)' }} /> Back to details
          </button>

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
      )}
    </div>
  )
}
