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
      {theme === 'light' ? <MoonSVG /> : <SunSVG />}
    </button>
  )
}
const SunSVG = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
const MoonSVG = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<FormTab>('new')
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <img src="/sbg-logo-white.svg" alt="" className="w-5 h-5" />
            <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>AWS Student Builder Group - PUP Biñan</span>
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => navigate('/')}
              className="btn btn--outline" style={{ fontSize: '11px', padding: '7px 14px' }}>
              <ArrowLeft size={12} /> Back
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div style={{ paddingTop: '3.5rem' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <div className="grid lg:grid-cols-12" style={{ border: '1px solid var(--line)' }}>

            {/* ── Left Panel: Info ── */}
            <div className="lg:col-span-5 p-8 lg:p-10" style={{ background: 'var(--card)', borderRight: '1px solid var(--line)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--orange)' }}>Registration</p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
                Join the Builder Community
              </h1>
              <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--muted)' }}>
                Apply for SBG membership and get your official digital membership ID card. Build, learn, and grow with AWS.
              </p>
              <ul className="space-y-3 mt-8">
                {[
                  'Official digital membership ID card',
                  'Access to AWS learning resources',
                  'Community events and workshops',
                  'Builder network at PUP Biñan',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted)' }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--orange)' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-12 pt-6" style={{ borderTop: '1px solid var(--line)' }}>
                <p className="text-[10px]" style={{ color: 'var(--muted)' }}>Powered by AWS. PUP Biñan Campus.</p>
              </div>
            </div>

            {/* ── Right Panel: Form ── */}
            <div className="lg:col-span-7 p-8 lg:p-10 lg:py-12">
              <div className="inline-flex w-full mb-8" style={{ border: '1px solid var(--line)' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold transition-all"
                  style={{
                    background: activeTab === 'new' ? 'var(--orange)' : 'transparent',
                    color: activeTab === 'new' ? '#0c0f14' : 'var(--muted)',
                  }}
                >
                  New Member
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('returning')}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold transition-all"
                  style={{
                    background: activeTab === 'returning' ? 'var(--blue)' : 'transparent',
                    color: activeTab === 'returning' ? '#0c0f14' : 'var(--muted)',
                  }}
                >
                  Returning Member
                </button>
              </div>

              <h2 className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>
                {activeTab === 'new' ? 'Create your application' : 'Renew your membership'}
              </h2>
              <p className="text-xs mb-8" style={{ color: 'var(--muted)' }}>
                {activeTab === 'new'
                  ? 'Fill out all three steps to complete your membership application.'
                  : 'Enter your SBG ID and upload your updated documents.'}
              </p>

              {activeTab === 'new' ? <RegistrationForm /> : <RenewalForm />}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
