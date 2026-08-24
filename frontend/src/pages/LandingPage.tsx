import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X, Cloud, Zap, Users, Trophy, Rocket } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { StaggerChildren, StaggerItem } from '../components/ui/StaggerChildren'
import { CountUp } from '../components/ui/CountUp'
import { TypingWords } from '../components/ui/TypingWords'
import { MentorCard } from '../components/ui/MentorCard'
import { FeatureCard } from '../components/ui/FeatureCard'
import { Penguin3D } from '../components/ui/Penguin3D'

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
    <div className="overflow-x-hidden">

      {/* ═══ NAV ═══ */}
     <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg header-fade" style={{ background: 'rgba(248,249,250,0.92)', borderBottom: '2px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-14">
          <button onClick={() => navigate('/')} className="flex items-center">
           <img src="/purple-bluelogo.svg" alt="SBG" className="h-14 sm:h-18 w-auto" />
          </button>
          <div className="hidden md:flex items-center gap-5">
            {['About', 'Events', 'FAQ'].map(item => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())}
                className="text-[12px] font-semibold transition-colors hover:text-[var(--accent-dark)]"
                style={{ color: 'var(--text-secondary)' }}
              >{item}</button>
            ))}
            <button onClick={() => navigate('/id-finder')} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '11px' }}>
              Find my ID
            </button>
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
<section className="relative pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">

  {/* Floating clouds */}
  <img
    src="/cloud.svg"
    alt=""
    aria-hidden="true"
    className="absolute top-12.5 left-[15%] w-32 sm:w-44 float pointer-events-none"
    style={{
      filter: 'drop-shadow(0 8px 22px rgba(35,160,223,0.35))'
    }}
  />

  <img
    src="/cloud.svg"
    alt=""
    aria-hidden="true"
    className="absolute top-24 right-[8%] w-36 sm:w-48 float-delayed pointer-events-none"
    style={{
      filter: 'drop-shadow(0 8px 22px rgba(154, 221, 255, 0.35))'
    }}
  />

  <img
    src="/cloud.svg"
    alt=""
    aria-hidden="true"
    className="absolute bottom-4 left-[10%] w-32 sm:w-44 float-delayed pointer-events-none hidden sm:block"
    style={{
      filter: 'drop-shadow(0 8px 22px rgba(35,160,223,0.35))'
    }}
  />
<img
  src="/cloud.svg"
  alt=""
  aria-hidden="true"
  className="absolute bottom-10 right-[10%] w-52 sm:w-72 float pointer-events-none hidden sm:block"
  style={{
    filter: 'drop-shadow(0 8px 22px rgba(35,160,223,0.35))'
  }}
/>

  <div className="max-w-3xl mx-auto px-5 text-center relative z-10">

    <motion.h1
      className="leading-[1.1] tracking-tight"
      initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      <span
        className="text-3xl sm:text-4xl lg:text-5xl font-black block"
        style={{ color: 'var(--text)' }}
      >
        Navigate the{' '}
        <span style={{ color: 'var(--accent)' }}>
          Cloud
        </span>
      </span>

     <span className="text-3xl sm:text-4xl lg:text-5xl font-black block mt-1" style={{ color: 'var(--text)' }}>
  with{' '}
  <span className="underline decoration-2 underline-offset-4" style={{ color: 'var(--accent)' ,  fontFamily: 'var(--font-jersey)',}}>
    <TypingWords
  className="underline decoration-2 underline-offset-4 text-4xl sm:text-5xl lg:text-6xl font-black"
  style={{
    color: 'var(--accent)',
    textShadow: '0 0 5px rgba(35,160,223,0.55), 0 0 5px rgba(35,160,223,0.3)',
  }}
/>
  </span>
</span>
    </motion.h1>

    <motion.p
      className="text-sm sm:text-base mt-6 max-w-md mx-auto leading-relaxed"
      style={{ color: 'var(--text-secondary)' }}
      initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 0.3
      }}
    >
      A globally recognized AWS student community. 60+ builders
      shipping real cloud projects, workshops, and hackathons.
      Your expedition starts here.
    </motion.p>

    <motion.div
      className="flex flex-wrap justify-center gap-3 mt-10"
      initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 0.5
      }}
    >
      <button
        onClick={() => navigate('/register')}
        className="btn-primary"
      >
        Start Your Journey
        <ArrowRight size={16} />
      </button>

      <button
        onClick={() => scrollTo('about')}
        className="btn-secondary"
      >
        Learn More
      </button>
    </motion.div>

    {/* Divider */}
    <motion.div
      className="w-full max-w-[758px] h-px mx-auto mt-7"
      style={{
        backgroundColor: 'rgba(117, 130, 145, 0.34)'
      }}
      initial={prefersReduced ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        delay: 0.65,
        duration: 0.5
      }}
    />

    {/* Stats */}
    <motion.div
      className="flex items-center justify-center gap-8 sm:gap-12 mt-8"
      initial={prefersReduced ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        delay: 0.7,
        duration: 0.5
      }}
    >
      {[
        { n: '63+', l: 'Builders' },
        { n: '12+', l: 'Events' },
        { n: '1st', l: 'Tech Org' },
      ].map(s => (
        <div key={s.l}>
          <p
           className="text-3xl sm:text-4xl font-black"
            style={{ color: 'var(--accent)' }}
          >
            {s.n}
          </p>

          <p
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-secondary)' }}
          >
            {s.l}
          </p>
        </div>
      ))}
    </motion.div>

  </div>
</section>

      {/* ═══ MARQUEE ═══ */}
      <section className="py-3 overflow-hidden" style={{ background: 'var(--accent)' }}>
        <div className="marquee-track">
          {[...Array(4)].map((_, rep) => (
            <div key={rep} className="flex items-center shrink-0">
              {['Build', 'Learn', 'Connect', 'Deploy', 'Grow', 'Hack', 'Ship', 'Collaborate'].map((item, i) => (
                <span key={`${rep}-${i}`} className="flex items-center gap-3 px-3">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wide text-white whitespace-nowrap">{item}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ ABOUT — "Meet our mascot" + Why Join ═══ */}
      <section id="about" className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5">

          {/* Meet the mascot */}
<ScrollReveal>
  <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10 mb-10">
    <Penguin3D className="w-56 h-56 sm:w-64 sm:h-64 shrink-0" />
    <div className="game-card p-6 sm:p-7 flex-1">
      <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Meet Frizz!</h3>
      <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        Our penguin mascot. Named after the frosty origins of the club: a Linux user who wanted to build a community from the ground up. Penguins thrive where nobody else dares to go. So do we.
      </p>
      <p className="text-[11px] mt-3 italic" style={{ color: 'var(--text-secondary)' }}>Model by: Aliyah Maglonso</p>
    </div>
  </div>
</ScrollReveal>

          {/* Why join */}
          <ScrollReveal>
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                Why join the guild?
              </h2>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                We're building a community that learns by doing and pushes what students can achieve.
              </p>
            </div>
          </ScrollReveal>

<div className="relative max-w-3xl mx-auto">
  <StaggerChildren className="grid sm:grid-cols-2 gap-5" staggerDelay={0.08}>
    {[
      { icon: '/programming_icon.svg', title: 'Hands-On Workshops', desc: 'Real AWS services. Real projects. Build your portfolio from day one.', color: 'var(--accent)' },
      { icon: '/star_icon.svg', title: 'Career Growth', desc: 'AWS certifications and skills that get you hired after graduation.', color: 'var(--accent)' },
      { icon: '/chip_icon.svg', title: 'Hackathons & Events', desc: 'Build nights, workshops, and tech talks. Learning should be fun.', color: 'var(--accent-purple)' },
      { icon: '/people_icon.svg', title: 'Community Driven', desc: 'Connect with fellow builders. Collaboration over competition.', color: 'var(--accent-purple)' },
    ].map((f) => (
      <StaggerItem key={f.title}>
        <FeatureCard {...f} />
      </StaggerItem>
    ))}
  </StaggerChildren>

  <img
    src="/awschip.svg"
    alt=""
    aria-hidden="true"
    className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 z-10 drop-shadow-md"
  />
</div>
        </div>
      </section>

      {/* ═══ ORIGIN STORY ═══ */}
      <section className="py-12 sm:py-16" style={{ background: 'var(--bg-raised)' }}>
  <div className="max-w-6xl mx-auto px-5">
    <ScrollReveal>
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-center mb-8" style={{ color: 'var(--text)' }}>
        Mentored by Innovators
      </h2>
    </ScrollReveal>
    <StaggerChildren className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto" staggerDelay={0.1}>
      <StaggerItem>
        <MentorCard
          photo="/founder.jpg"
          name="John Lexter Reyes"
          role="President, AWS Student Builder Group - PUP Binan"
          quote={`"Just join your university's tech club," they said. PUP Binan didn't have one. No cloud workshops, no hackathons, no community. So one Linux user stopped waiting and started building. From zero to 63+ members. From nothing to a globally recognized AWS chapter.`}
        />
      </StaggerItem>
      <StaggerItem>
        <MentorCard
          photo="/maaminda.png"
          name="Indaleen Quinsayas"
          role="Faculty Adviser, AWS Student Builder Group - PUP Binan"
        />
      </StaggerItem>
    </StaggerChildren>
  </div>
</section>

      {/* ═══ HOW TO JOIN ═══ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5">
          <ScrollReveal>
            <div className="text-center max-w-xl mx-auto mb-8">
             <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: 'var( --accent-purple)' }}>
   How do you join?
              </h2>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                Four steps. Zero prerequisites. From curious to certified.
              </p>
            </div>
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
                  <span className="text-2xl font-black block mb-1.5" style={{ color: 'var(--accent)', opacity: 0.25 }}>{n}</span>
                  <h3 className="text-xs font-bold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="py-6" style={{ background: 'var(--accent-purple)' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center text-white">
            {[
              { value: 63, suffix: '+', label: 'Active Builders' },
              { value: 12, suffix: '+', label: 'Events Shipped' },
              { value: 1, suffix: 'st', label: 'Tech Org at PUP Binan' },
              { value: 2026, suffix: '', label: 'Year Founded' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-black">
                  <CountUp end={stat.value} duration={stat.value > 100 ? 2.5 : 1.5} suffix={stat.suffix} />
                </p>
                <p className="text-[10px] font-semibold mt-1 text-white/80 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EVENTS ═══ */}
      <section id="events" className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5 mb-6">
          <ScrollReveal>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              Past events
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>We don't just talk. We ship.</p>
          </ScrollReveal>
        </div>
        <div className="overflow-hidden">
          <div className="gallery-track px-5">
            {[...PAST_EVENTS, ...PAST_EVENTS].map((ev, i) => (
              <div key={i} className="shrink-0 w-[250px] sm:w-[290px] group">
                <div className="game-card overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={ev.image} alt={ev.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'var(--accent)', color: 'white' }}>{ev.type}</span>
                      <p className="text-[11px] font-bold mt-1.5 text-white leading-tight">{ev.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-12 sm:py-16" style={{ background: 'var(--bg-raised)' }}>
        <div className="max-w-2xl mx-auto px-5">
          <ScrollReveal>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-center mb-6" style={{ color: 'var(--text)' }}>
              Frequently asked
            </h2>
          </ScrollReveal>
          <div>
            {FAQS.map(([q, a], i) => (
              <div key={i} className="game-card mb-3 overflow-hidden">
                <button
                  onClick={() => setFaqOpen(f => f === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left"
                >
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{q}</span>
                  <motion.span
                    animate={{ rotate: faqOpen === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-lg font-bold leading-none"
                    style={{ color: 'var(--accent-dark)' }}
                  >+</motion.span>
                </button>
                <div className={`grid transition-all duration-300 ${faqOpen === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <p className="text-sm px-4 pb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5">
          <ScrollReveal>
            <div className="game-card p-6 sm:p-8 text-center relative overflow-hidden">
              <img src="/lowpoly 2.png" alt="" className="absolute -bottom-6 -right-6 w-36 sm:w-44 opacity-15 pointer-events-none" aria-hidden="true" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight relative z-10" style={{ color: 'var(--text)' }}>
                Ready to start building?
              </h2>
              <p className="text-xs mt-2 relative z-10" style={{ color: 'var(--text-secondary)' }}>
                No experience needed. Just curiosity and a willingness to learn.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-5 relative z-10">
                <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '12px 28px' }}>
                  Join the Builders <ArrowRight size={16} />
                </button>
                <button onClick={() => navigate('/id-finder')} className="btn-secondary" style={{ padding: '12px 28px' }}>
                  Find my ID Card
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: '2px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-5 py-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
            <div className="flex items-center gap-3">
              <img src="/awschip.svg" alt="" className="w-10 h-10" />
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>AWS Student Builder Group</p>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>PUP Binan Campus. Est. 2026.</p>
              </div>
            </div>
            <div className="flex gap-8 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => navigate('/register')} className="text-left hover:text-[var(--accent-dark)] transition-colors">Register</button>
                <button onClick={() => navigate('/id-finder')} className="text-left hover:text-[var(--accent-dark)] transition-colors">ID Finder</button>
              </div>
              <div className="flex flex-col gap-1.5">
                <a href="https://www.facebook.com/profile.php?id=61584279257151" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-dark)] transition-colors">Facebook</a>
                <a href="https://www.instagram.com/_awsccfrizz" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-dark)] transition-colors">Instagram</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 text-[10px]" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            &copy; 2026 AWS Student Builder Group, PUP Binan. Built by students, for students.
          </div>
        </div>
      </footer>
    </div>
  )
}


