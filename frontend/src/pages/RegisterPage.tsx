import { useState } from 'react'
import { ArrowRight, Check, ChevronDown, ExternalLink, ShieldCheck } from 'lucide-react'
import { RegistrationForm } from '../components/registration/RegistrationForm'
import { RenewalForm } from '../components/registration/RenewalForm'
import { REGISTRATION_DRAFT_STORAGE_KEY } from '../store/registration'

type FormTab = 'new' | 'returning'
const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || '/'

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<FormTab>('new')
  const [started, setStarted] = useState(() => {
    if (typeof window === 'undefined') return false
    return Boolean(window.localStorage.getItem(REGISTRATION_DRAFT_STORAGE_KEY))
  })
  const [agreed, setAgreed] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  const openApplication = (tab: FormTab = 'new') => {
    setActiveTab(tab)
    setStarted(true)
    const alignApplicationPanel = () => {
      const panel = document.getElementById('application-panel')
      if (!panel) return
      const target = panel.getBoundingClientRect().top + window.scrollY - 16
      window.scrollTo({ top: Math.max(0, target), behavior: 'auto' })
    }
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(alignApplicationPanel)
    })
    window.setTimeout(alignApplicationPanel, 350)
  }

  return <div data-theme="dark" className="form-page">
    <div className="form-grid" aria-hidden="true" />
    <header className="form-nav">
      <a href={MARKETING_URL} className="form-brand"><img src="/sbg-logo-white.svg" alt="" /><span><strong>AWS Student Builder Group</strong><small>PUP Biñan · Membership Portal</small></span></a>
      <div className="nav-status"><span /> APPLICATION PORTAL</div>
    </header>

    <main className="form-main">
      <div className="form-intro">
        <div className="form-kicker"><span /> MEMBERSHIP APPLICATION</div>
        <h1>Build your next<br /><em>chapter.</em></h1>
        <p>Apply to join the AWS Student Builder Group at PUP Biñan. Tell us a little about yourself, your interests, and how you want to grow with the community.</p>
        <div className="form-trust"><ShieldCheck size={16} /><span>Your information is reviewed by the SBG Core Team.</span></div>
      </div>

      <section id="application-panel" className="application-panel" aria-labelledby="application-title">
        {!started ? <>
          <div className="panel-top"><div><span className="panel-index">01</span><span className="panel-label">BEFORE YOU BEGIN</span></div><span className="panel-open"><i /> OPEN</span></div>
          <div className="panel-body">
            <h2 id="application-title">A clear start.</h2>
            <p className="panel-lede">Prepare these before beginning. The application is completed in three short steps.</p>
            <div className="requirement-list"><div><span>01</span><div><strong>Student details</strong><p>Your student number and PUP webmail</p></div></div><div><span>02</span><div><strong>Proof of share</strong><p>A screenshot showing you shared our recruitment post</p><a className="requirement-link" href="https://www.facebook.com/share/p/1TsmczrMTD/" target="_blank" rel="noopener noreferrer">Open recruitment post <ExternalLink size={13} aria-hidden="true" /></a></div></div><div><span>03</span><div><strong>Optional document</strong><p>Your Certificate of Registration can be submitted later</p></div></div></div>
            <div className="privacy-panel"><div className="privacy-title"><h3>Data privacy</h3><span>REQUIRED</span></div><p>We collect your details only to review your membership application and communicate with you about its status.</p><button type="button" className="privacy-toggle" onClick={() => setPrivacyOpen((value) => !value)} aria-expanded={privacyOpen}>{privacyOpen ? 'Hide details' : 'Read details'} <ChevronDown size={14} /></button><div hidden={!privacyOpen} className="privacy-details">The data we collect includes your student number, personal email, PUP webmail, gender, Certificate of Registration, and proof-of-share screenshot. It is used solely for verification and communication. Application documents are deleted at the end of each semester.</div><label className="consent-row"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span><Check size={14} /> I understand and consent to how my data will be collected, used, and stored.</span></label></div>
            <button type="button" className="form-primary" disabled={!agreed} onClick={() => openApplication()}>Continue to application <ArrowRight size={17} /></button>{!agreed && <p className="form-hint">Consent is required before continuing.</p>}
            <p className="switch-form">Already a member? <button type="button" onClick={() => { setAgreed(true); openApplication('returning') }}>Renew your membership</button></p>
          </div>
        </> : <>
          <div className="panel-top"><div><span className="panel-index">02</span><span className="panel-label">YOUR APPLICATION</span></div><button type="button" className="back-to-start" onClick={() => setStarted(false)}>Back to details</button></div>
          <div className="panel-body form-body"><div role="tablist" aria-label="Application type" className="form-tabs"><button type="button" role="tab" aria-selected={activeTab === 'new'} onClick={() => setActiveTab('new')}>New member</button><button type="button" role="tab" aria-selected={activeTab === 'returning'} onClick={() => setActiveTab('returning')}>Returning member</button></div><div className="form-heading"><h2 id="application-title">{activeTab === 'new' ? 'Create your application' : 'Renew your membership'}</h2><p>{activeTab === 'new' ? 'Complete each step to send your application.' : 'Verify your membership, then upload your updated documents.'}</p></div>{activeTab === 'new' ? <RegistrationForm /> : <RenewalForm />}</div>
        </>}
      </section>
    </main>
    <footer className="form-footer"><span>© AWS Student Builder Group · PUP Biñan</span><a href="mailto:sbg.pupbinan@gmail.com">Need help? Contact the chapter</a></footer>
  </div>
}
