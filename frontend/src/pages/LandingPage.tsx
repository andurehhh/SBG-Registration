import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X, Zap, Users, Trophy, Rocket } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { StaggerChildren, StaggerItem } from '../components/ui/StaggerChildren'
import { CountUp } from '../components/ui/CountUp'

const PAST_EVENTS = [
  { title: 'Cloud Kickstart 2026', type: 'Seminar', image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1786964581/cloud_kickstart_xm9qo3.jpg' },
  { title: 'Prompt.Spec.Deploy.', type: 'Workshop', image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1786964582/Promptspecdeploy_noxion.jpg' },
  { title: 'Cloud Kickstart 2026', type: 'Seminar', image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1787006504/4_12_sd3gki.png' },
  { title: 'Prompt.Spec.Deploy.', type: 'Workshop', image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1787006830/prompt_eio9dm.jpg' },
  { title: 'Cloud Kickstart Highlights', type: 'Seminar', image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1787006505/Happening_now_post_event_highlights_posting_template_8_mixbml.png' },
  { title: 'Prompt.Spec.Deploy.', type: 'Workshop', image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1787006830/prompt1_yzcv9l.jpg' },
  { title: 'Cloud Kickstart Highlights', type: 'Seminar', image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1787006504/Happening_now_post_event_highlights_posting_template_20_yljntc.png' },
  { title: 'Prompt.Spec.Deploy.', type: 'Workshop', image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1787006830/prompt3_nbszjs.jpg' },
]

const FAQS = [
  ['Do I need experience?', 'Zero. Most builders start as beginners. Our workshops are made for first-timers.'],
  ['Is it free?', 'Yes! AWS provides credits through our partnership.'],
  ['How do I join?', '5-minute form. Get approved. Get your digital ID card. Join Discord.'],
  ['What do I get?', 'Digital membership ID, workshop access, Discord community, networking events.'],
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const prefersReduced = useReducedMotion()

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <div data-theme="light" style={{ background: 'var(--bg)' }} className="overflow-x-hidden">

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg" style={{ background: 'rgba(247,248,250,0.92)', borderBottom: '1.5px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-14">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <img src="/sbg-logo-white.svg" alt="SBG" className="h-7 w-auto" />
            <span className="text-[11px] font-bold hidden sm:block" style={{ color: 'var(--text)' }}>AWS Student Builder Group PUP Biñan</span>
          </button>
          <div className="hidden md:flex items-center gap-5">
            {['About', 'Events', 'FAQ'].map(item => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())}
                className="text-[12px] font-semibold transition-colors hover:text-[var(--accent-dark)]"
                style={{ color: 'var(--text-secondary)' }}
              >{item}</button>
            ))}
            <button onClick={() => navigate('/id-finder')} className="text-[12px] font-semibold transition-colors hover:text-[var(--accent-dark)]" style={{ color: 'var(--text-secondary)' }}>Find ID</button>
            <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '6px 14px', fontSize: '11px' }}>
              Join <ArrowRight size={12} />
            </button>
          </div>
          <button className="md:hidden" onClick={() => setMobileOpen(v => !v)} style={{ color: 'var(--text-secondary)' }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden px-5 py-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
            {['About', 'Events', 'FAQ'].map(item => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="block w-full text-left py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</button>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={() => { navigate('/id-finder'); setMobileOpen(false) }} className="btn-secondary flex-1" style={{ fontSize: '11px', padding: '8px' }}>Find ID</button>
              <button onClick={() => { navigate('/register'); setMobileOpen(false) }} className="btn-primary flex-1" style={{ fontSize: '11px', padding: '8px' }}>Join</button>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-20 pb-8 sm:pt-24 sm:pb-10 lg:pt-28 lg:pb-12 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-4 items-center">

            {/* Left — clear focal hierarchy: badge → headline → sub → CTA */}
            <div className="lg:col-span-6 relative z-10">
              <motion.div
                className="pixel-badge mb-5"
                initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
                The first tech org at PUP Biñan
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.08] tracking-tight"
                style={{ color: 'var(--text)' }}
                initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                Navigate the Cloud.
              </motion.h1>

              <motion.p
                className="text-sm sm:text-base mt-4 max-w-md leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
                initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                A globally recognized AWS student community. 60+ builders shipping real cloud projects, workshops, and hackathons.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3 mt-6"
                initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <button onClick={() => navigate('/register')} className="btn-primary">
                  Join the community <ArrowRight size={16} />
                </button>
                <button onClick={() => navigate('/id-finder')} className="btn-secondary">
                  Find my ID
                </button>
              </motion.div>
            </div>

            {/* Right — Penguin only, no floating icon clutter */}
            <motion.div
              className="lg:col-span-6 relative flex items-center justify-center"
              initial={prefersReduced ? {} : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative w-full max-w-[360px] mx-auto">
                <div className="absolute inset-0 rounded-full blur-[80px] opacity-15 scale-75" style={{ background: 'var(--accent)' }} aria-hidden="true" />
                <img
                  src="/lowpoly 2.png"
                  alt="SBG Penguin Mascot"
                  className="relative z-10 w-full h-auto float drop-shadow-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS STRIP — single source of truth for numbers ═══ */}
      <section className="py-6" style={{ background: 'var(--accent)' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-3 gap-4 text-center text-white">
            {[
              { value: 63, suffix: '+', label: 'Builders' },
              { value: 12, suffix: '+', label: 'Events' },
              { value: 1, suffix: 'st', label: 'Tech Org' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-xl sm:text-2xl font-black">
                  <CountUp end={stat.value} duration={1.5} suffix={stat.suffix} />
                </p>
                <p className="text-[9px] font-semibold mt-0.5 text-white/80 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ABOUT — left-aligned, no mascot repeat ═══ */}
      <section id="about" className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5">
          <ScrollReveal>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--text)' }}>
              What you get as a member
            </h2>
            <p className="text-xs mb-8 max-w-md" style={{ color: 'var(--text-secondary)' }}>
              We're building a community that learns by doing and pushes what students can achieve.
            </p>
          </ScrollReveal>

          <StaggerChildren className="grid sm:grid-cols-2 gap-3" staggerDelay={0.08}>
            {[
              { icon: <Zap size={18} />, title: 'Hands-On Workshops', desc: 'Real AWS services. Real projects. Build your portfolio from day one.', color: 'var(--accent)' },
              { icon: <Users size={18} />, title: 'Community', desc: 'Connect with fellow builders. Collaboration over competition.', color: 'var(--success)' },
              { icon: <Trophy size={18} />, title: 'Career Growth', desc: 'AWS certifications and skills that get you hired after graduation.', color: 'var(--warm)' },
              { icon: <Rocket size={18} />, title: 'Hackathons & Events', desc: 'Build nights, workshops, and tech talks. Learning should be fun.', color: 'var(--accent-dark)' },
            ].map(({ icon, title, desc, color }) => (
              <StaggerItem key={title}>
                <div className="game-card p-4 h-full">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center mb-2" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}>
                    {icon}
                  </div>
                  <h3 className="text-xs font-bold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══ MISSION & VISION ═══ */}
      <section className="py-12 sm:py-16" style={{ background: 'var(--bg-raised)' }}>
        <div className="max-w-6xl mx-auto px-5">
          <ScrollReveal>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-6" style={{ color: 'var(--text)' }}>
              Our purpose
            </h2>
          </ScrollReveal>
          <StaggerChildren className="grid sm:grid-cols-2 gap-4" staggerDelay={0.1}>
            <StaggerItem>
              <div className="game-card p-5 h-full">
                <div className="w-8 h-1 rounded-full mb-3" style={{ background: 'var(--accent)' }} />
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>Mission</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  To empower students to master cloud technology through collaboration, hands-on practice, and community. We bridge the gap between classroom theory and real-world cloud engineering.
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="game-card p-5 h-full">
                <div className="w-8 h-1 rounded-full mb-3" style={{ background: 'var(--warm)' }} />
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>Vision</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  To be the leading student-run cloud computing community in the Philippines, building a generation of cloud-ready graduates who are confident, certified, and connected.
                </p>
              </div>
            </StaggerItem>
          </StaggerChildren>
        </div>
      </section>

      {/* ═══ WHAT IS AWS? ═══ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5">
          <ScrollReveal>
            <div className="game-card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* AWS Logo */}
                <div className="shrink-0">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" alt="Amazon Web Services" className="w-20 sm:w-24 h-auto" />
                </div>
                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                    Built on the same cloud that powers Netflix, Airbnb, and NASA.
                  </h2>
                  <p className="text-xs sm:text-sm leading-relaxed mt-3" style={{ color: 'var(--text-secondary)' }}>
                    Amazon Web Services is the world's most adopted cloud platform — 200+ services, used by millions of companies, startups, and governments worldwide. When you learn AWS, you're learning the infrastructure that runs the modern internet.
                  </p>
                  <p className="text-xs sm:text-sm leading-relaxed mt-3" style={{ color: 'var(--text-secondary)' }}>
                    <b style={{ color: 'var(--text)' }}>AWS Student Builder Groups</b> are the official student communities recognized by Amazon. Our chapter gives PUP Biñan students something most universities don't have: direct access to cloud credits, certification pathways, mentorship, and a global network of builders — all while still in school.
                  </p>
                  <p className="text-xs font-medium mt-4" style={{ color: 'var(--accent)' }}>
                    You're not just joining a club. You're joining a global ecosystem.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ OUR STORY ═══ */}
      <section className="py-12 sm:py-16" style={{ background: 'var(--bg-raised)' }}>
        <div className="max-w-6xl mx-auto px-5">
          <ScrollReveal>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4" style={{ color: 'var(--text)' }}>
              Our story
            </h2>
          </ScrollReveal>

          {/* Timeline */}
          <ScrollReveal>
            <div className="flex flex-col gap-4">
              <div className="game-card p-4 sm:p-5">
                <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>2026</span>
                <h3 className="text-sm font-bold mt-1" style={{ color: 'var(--text)' }}>Founded as AWS Cloud Club</h3>
                <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>
                  PUP Biñan had no tech organization. One student decided to change that. The AWS Cloud Club was established as the first and only tech org on campus — starting from zero members, built entirely from scratch.
                </p>
              </div>
              <div className="game-card p-4 sm:p-5">
                <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>2026</span>
                <h3 className="text-sm font-bold mt-1" style={{ color: 'var(--text)' }}>Evolved into AWS Student Builder Group</h3>
                <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>
                  AWS restructured its student communities globally, transitioning Cloud Clubs into Student Builder Groups — expanding the program's scope beyond cloud into AI, serverless, and full-stack development. Our chapter was among those that made the transition, unlocking more resources, mentorship, and global recognition.
                </p>
              </div>
              <div className="game-card p-4 sm:p-5">
                <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>Today</span>
                <h3 className="text-sm font-bold mt-1" style={{ color: 'var(--text)' }}>63+ builders and growing</h3>
                <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Now a globally recognized AWS student community with 63+ active members. We run workshops, hackathons, and tech talks — giving PUP Biñan students hands-on experience with production cloud infrastructure before they graduate.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Founder card — highlighted */}
          <ScrollReveal>
            <div className="mt-6 p-5 sm:p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(45,156,219,0.08) 0%, rgba(45,156,219,0.02) 100%)', border: '1.5px solid rgba(45,156,219,0.2)' }}>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <img
                  src="/My picture.jpg"
                  alt="John Lexter Reyes"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
                  style={{ border: '2px solid rgba(45,156,219,0.3)' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement!.innerHTML = '<div style="width:6rem;height:6rem;display:flex;align-items:center;justify-content:center;background:rgba(45,156,219,0.1);color:var(--accent-dark);font-size:1.5rem;font-weight:800;border-radius:12px;border:2px solid rgba(45,156,219,0.3)">JR</div>'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Founder &amp; President</span>
                  <h3 className="text-base sm:text-lg font-bold mt-1" style={{ color: 'var(--text)' }}>John Lexter Reyes</h3>
                  <p className="text-xs mt-2 leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                    "There was no tech club here. No cloud workshops, no hackathons, no community for students who wanted to build real things. So I stopped asking 'why not' and just built it."
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <a href="https://www.facebook.com/profile.php?id=61584279257151" target="_blank" rel="noopener noreferrer" className="text-[10px] font-semibold transition-colors" style={{ color: 'var(--accent)' }}>Facebook</a>
                    <span style={{ color: 'var(--border)' }}>|</span>
                    <a href="https://www.instagram.com/_awsccfrizz" target="_blank" rel="noopener noreferrer" className="text-[10px] font-semibold transition-colors" style={{ color: 'var(--accent)' }}>Instagram</a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ HOW TO JOIN — left-aligned heading for variety ═══ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5">
          <ScrollReveal>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--text)' }}>
              How to join
            </h2>
            <p className="text-xs mb-8 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              Four steps. Zero prerequisites.
            </p>
          </ScrollReveal>

          <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-3" staggerDelay={0.1}>
            {[
              { n: '01', title: 'Apply', desc: '5-minute form. We review within the week.' },
              { n: '02', title: 'Get your ID', desc: 'Digital membership card with QR code.' },
              { n: '03', title: 'Build', desc: 'Workshops, hackathons, real AWS infra.' },
              { n: '04', title: 'Level up', desc: 'Lead workshops, mentor others, get certified.' },
            ].map(({ n, title, desc }) => (
              <StaggerItem key={n}>
                <div className="game-card p-4 h-full">
                  <span className="text-2xl font-black block mb-1" style={{ color: 'var(--accent)', opacity: 0.2 }}>{n}</span>
                  <h3 className="text-xs font-bold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══ EVENTS ═══ */}
      <section id="events" className="py-12 sm:py-16" style={{ background: 'var(--bg-raised)' }}>
        <div className="max-w-6xl mx-auto px-5 mb-6">
          <ScrollReveal>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              Past events
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Workshops, seminars, and hackathons we've shipped.</p>
          </ScrollReveal>
        </div>
        <div className="overflow-hidden">
          <div className="gallery-track px-5">
            {[...PAST_EVENTS, ...PAST_EVENTS].map((ev, i) => (
              <div key={i} className="shrink-0 w-[240px] sm:w-[280px] group">
                <div className="game-card overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={ev.image} alt={ev.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: 'var(--accent)', color: 'white' }}>{ev.type}</span>
                      <p className="text-[10px] font-bold mt-1 text-white leading-tight">{ev.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-5">
          <ScrollReveal>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-6" style={{ color: 'var(--text)' }}>
              Frequently asked
            </h2>
          </ScrollReveal>
          <div>
            {FAQS.map(([q, a], i) => (
              <div key={i} className="game-card mb-2 overflow-hidden">
                <button
                  onClick={() => setFaqOpen(f => f === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left"
                >
                  <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{q}</span>
                  <motion.span
                    animate={{ rotate: faqOpen === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-base font-bold leading-none"
                    style={{ color: 'var(--accent-dark)' }}
                  >+</motion.span>
                </button>
                <div className={`grid transition-all duration-300 ${faqOpen === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <p className="text-xs px-4 pb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-12 sm:py-16" style={{ background: 'var(--bg-raised)' }}>
        <div className="max-w-6xl mx-auto px-5">
          <ScrollReveal>
            <div className="game-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                  Ready to start building?
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  No experience needed. Just curiosity.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '10px 20px', fontSize: '12px' }}>
                  Join <ArrowRight size={14} />
                </button>
                <button onClick={() => navigate('/id-finder')} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '12px' }}>
                  Find ID
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: '1.5px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-5 py-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/sbg-logo-white.svg" alt="" className="h-7 w-auto" />
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>AWS Student Builder Group</p>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>PUP Biñan Campus. Est. 2026.</p>
              </div>
            </div>
            <div className="flex gap-8 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text)' }}>Pages</span>
                <button onClick={() => navigate('/register')} className="text-left hover:text-[var(--accent-dark)] transition-colors">Register</button>
                <button onClick={() => navigate('/id-finder')} className="text-left hover:text-[var(--accent-dark)] transition-colors">ID Finder</button>
                <button onClick={() => navigate('/submit-cor')} className="text-left hover:text-[var(--accent-dark)] transition-colors">Submit COR</button>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text)' }}>Connect</span>
                <a href="https://www.facebook.com/profile.php?id=61584279257151" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-dark)] transition-colors">Facebook</a>
                <a href="https://www.instagram.com/_awsccfrizz" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-dark)] transition-colors">Instagram</a>
                <a href="mailto:sbg.pupbinan@gmail.com" className="hover:text-[var(--accent-dark)] transition-colors">sbg.pupbinan@gmail.com</a>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px]" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <span>&copy; 2026 AWS Student Builder Group, PUP Biñan</span>
            <span style={{ fontStyle: 'italic' }}>"It's Always Day One!"</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
