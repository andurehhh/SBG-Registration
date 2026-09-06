import { useState } from 'react'
import { ArrowRight, Check, ChevronDown } from 'lucide-react'
import { RegistrationForm } from '../components/registration/RegistrationForm'
import { RenewalForm } from '../components/registration/RenewalForm'
import { BlueCubes } from '../components/ui/BlueCubes'

type FormTab = 'new' | 'returning'

// Main marketing site — the logo links here.
const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || '/'

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
  const [privacyOpen, setPrivacyOpen] = useState(false)

  return (
    <div data-theme="dark" style={{ background: 'var(--bg)' }} className="min-h-screen relative">

      {/* Decorative grid glow overlay + floating blue cubes */}
      <div className="grid-overlay pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
      <BlueCubes />

      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <a href={MARKETING_URL} className="flex items-center gap-2">
            <img src="/sbg-logo-white.svg" alt="" className="w-6 h-6" />
            <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>AWS SBG - PUP Biñan</span>
          </a>
        </div>
      </nav>

      {/* ── INTRO GATE ── */}
      {!started ? (
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Hero */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded" style={{ border: '1px solid rgba(47,143,255,0.3)', background: 'var(--accent-dim)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-bright)' }} />
              <span className="text-[11px] font-medium tracking-wide" style={{ color: 'var(--accent-bright)', fontFamily: 'var(--font-mono)' }}>MEMBERSHIP APPLICATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight" style={{ color: 'var(--text)' }}>
              Learn cloud computing.<br />Build real projects. <span className="gradient-text">Get hired.</span>
            </h1>
            <p className="text-sm sm:text-base mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Join the first tech organization at PUP Biñan. Get hands-on with AWS through workshops, hackathons, and certification pathways. Members also receive an official digital membership ID card.
            </p>
          </div>

          {/* Before you apply + What you'll need — one panel */}
          <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
            <div className="px-6 py-4" style={{ background: 'var(--accent)' }}>
              <h2 className="text-base font-bold text-white">Before you apply</h2>
            </div>
            <div className="p-6" style={{ background: 'var(--bg-raised)' }}>
              {/* Eligibility rows — more breathing room */}
              <div className="space-y-5">
                {ELIGIBILITY.map(([label, value]) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:gap-5">
                    <span className="text-sm font-bold shrink-0 sm:w-36 mb-0.5 sm:mb-0" style={{ color: 'var(--text)' }}>{label}</span>
                    <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="my-6 h-px" style={{ background: 'var(--border)' }} />

              {/* What you'll need */}
              <p className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>What you'll need</p>
              <div className="space-y-3">
                {[
                  'Your student number and PUP webmail',
                  'A screenshot proving you shared our recruitment post (required)',
                  'Your Certificate of Registration — optional, can be submitted later',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                    <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy consent */}
          <div className="rounded-xl p-6 mb-6" style={{ border: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
            <h2 className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>Data privacy</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary, var(--text))' }}>
              We collect your details only to review your membership application, accessible only to SBG Core Team officers.
            </p>

            {/* Accessible disclosure */}
            <div
              id="privacy-details"
              role="region"
              aria-label="Full privacy details"
              hidden={!privacyOpen}
              className="text-sm leading-relaxed mt-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              The data we collect includes your student number, personal email, PUP webmail, gender, Certificate of Registration, and proof-of-share screenshot. It is used solely for verification and communication. Application documents (COR and screenshots) are deleted at the end of each semester.
            </div>

            <button
              type="button"
              onClick={() => setPrivacyOpen((v) => !v)}
              aria-expanded={privacyOpen}
              aria-controls="privacy-details"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold rounded"
              style={{ color: 'var(--accent-bright, var(--accent))' }}
            >
              {privacyOpen ? 'Read less' : 'Read more'}
              <ChevronDown
                size={14}
                aria-hidden="true"
                style={{ transform: privacyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            </button>

            <label className="flex items-start gap-3 cursor-pointer select-none mt-4">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-5 h-5 shrink-0 cursor-pointer"
                style={{ accentColor: 'var(--accent)' }}
              />
              <span className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                I understand and consent to how my data will be collected, used, and stored.
              </span>
            </label>
          </div>

          {/* Start CTA */}
          <button
            onClick={() => setStarted(true)}
            disabled={!agreed}
            aria-describedby={!agreed ? 'start-disabled-reason' : undefined}
            className="btn-primary w-full"
            style={{ minHeight: '48px', padding: '14px' }}
          >
            Start Application <ArrowRight size={16} aria-hidden="true" />
          </button>
          {!agreed && (
            <p id="start-disabled-reason" className="text-xs text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
              Please agree to the data privacy notice above to continue.
            </p>
          )}
          <p className="text-sm text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
            Already a member?{' '}
            <button
              onClick={() => { setActiveTab('returning'); setStarted(true); setAgreed(true) }}
              className="font-semibold inline-flex items-center min-h-[44px] rounded"
              style={{ color: 'var(--accent-bright, var(--accent))' }}
            >
              Renew here
            </button>
          </p>
        </div>
      ) : (
        /* ── FORM ── */
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Back to intro */}
          <button
            onClick={() => setStarted(false)}
            className="text-sm font-medium mb-4 inline-flex items-center gap-1.5 min-h-[44px] rounded"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowRight size={14} aria-hidden="true" style={{ transform: 'rotate(180deg)' }} /> Back to details
          </button>

          {/* Tabs */}
          <div role="tablist" aria-label="Application type" className="flex mb-5 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <button
              type="button"
              role="tab"
              id="tab-new"
              aria-selected={activeTab === 'new'}
              aria-controls="panel-form"
              onClick={() => setActiveTab('new')}
              className="flex-1 min-h-[44px] px-3 text-sm font-medium transition-all"
              style={{
                background: activeTab === 'new' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'new' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              New Member
            </button>
            <button
              type="button"
              role="tab"
              id="tab-returning"
              aria-selected={activeTab === 'returning'}
              aria-controls="panel-form"
              onClick={() => setActiveTab('returning')}
              className="flex-1 min-h-[44px] px-3 text-sm font-medium transition-all"
              style={{
                background: activeTab === 'returning' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'returning' ? '#ffffff' : 'var(--text-secondary)',
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
          <div id="panel-form" role="tabpanel" aria-labelledby={activeTab === 'new' ? 'tab-new' : 'tab-returning'}>
            {activeTab === 'new' ? <RegistrationForm /> : <RenewalForm />}
          </div>
        </div>
      )}
    </div>
  )
}
