import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X, ArrowUpRight, ChevronDown } from 'lucide-react'

// @ts-expect-error Sections are commented out but data is kept for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROJECTS: { title: string; status: string }[] = [
  { title: 'SBG Registration System', status: 'Details coming soon' },
  { title: 'Cloud Cost Calculator', status: 'Details coming soon' },
  { title: 'Digital ID Card System', status: 'Details coming soon' },
  { title: 'AWS Workshop Portal', status: 'Details coming soon' },
]

// @ts-expect-error Sections are commented out but data is kept for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EVENTS: [string, string, string, string, string, number, number, string][] = [
  ['AWSome Day Workshop', 'Aug 15', '1:00 PM', 'CICT Lab', 'Hands-on intro to AWS core services. Deploy your first EC2 instance and S3 bucket with guided labs.', 28, 40, 'Workshop'],
  ['Cloud Career Talk', 'Aug 22', '2:00 PM', 'Online via Zoom', 'Industry panel with AWS engineers. Learn what cloud roles actually look like day-to-day.', 67, 100, 'Talk'],
  ['Build Night: Serverless', 'Sep 5', '6:00 PM', 'Room 301', 'Team sprint to build a serverless app using Lambda + API Gateway. Pizza provided.', 12, 30, 'Hackathon'],
  ['Cert Study Group', 'Sep 12', '3:00 PM', 'CICT Lab', 'Weekly session covering Cloud Practitioner exam domains. Practice tests + review.', 18, 25, 'Study'],
]

const PAST_EVENTS = [
  //Talk, Hackathon, Workshop,Study
  { title: 'Cloud Kickstart 2026: Navigating Your Way into the Cloud', date: 'March 2026', type: 'Workshop', image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1786964581/cloud_kickstart_xm9qo3.jpg' },
  { title: 'Prompt.Spec.Deploy.', date: 'April 2026', type: 'Workshop', image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1786964582/Promptspecdeploy_noxion.jpg' },
  ]

const FAQS = [
  // ['What\'s the time commitment?', 'Workshops are 1-2 hours weekly. Build nights and study groups are optional. You decide your level.'],
  ['Do I need AWS experience?', 'Zero. Most members start as beginners. Workshops are built for first-timers.'],
  ['Is it free?', 'Yes. AWS provides credits through our partnership. Some events may have minimal fees for food.'],
  ['How do I join?', 'Fill out the form (5 min). Get approved. Get your digital ID card. Join Discord.'],
]

const NAV = ['About', 'Gallery', 'FAQ']

const TEAM_TERMS = [
  { label: 'AY 2026-2027 — 1st Sem', value: '26-27-1' },
  { label: 'AY 2026-2027 — 2nd Sem', value: '26-27-2' },
  { label: 'AY 2027-2028 — 1st Sem', value: '27-28-1' },
]

interface TeamMember {
  name: string
  role: string
  initials: string
  image?: string
  description: string
  socials: { github?: string; linkedin?: string; facebook?: string }
}

const TEAM_MEMBERS: Record<string, TeamMember[]> = {
  '25-26': [
    { name: 'John Lexter Reyes', role: 'Founder & President', initials: 'JR', image: '/My picture.jpg', description: 'Founded SBG to bring hands-on AWS experience to PUP Biñan. Passionate about cloud infrastructure and building developer communities.', socials: { github: '#', linkedin: '#', facebook: '#' } },
    { name: 'Renae Chloe Bautista', role: 'Vice President', initials: 'AJ', description: 'Drives club operations and strategic direction. Focused on scaling SBG through industry partnerships and member growth.', socials: { github: '#', linkedin: '#', facebook: '#' } },
    { name: 'Maria Santos', role: 'Secretary', initials: 'MS', description: 'Keeps everything organized. Manages documentation, meeting notes, and club communications.', socials: { github: '#', linkedin: '#' } },
    { name: 'Juan Dela Cruz', role: 'Treasurer', initials: 'JC', description: 'Manages club funds and AWS credit allocation. Ensures resources are maximized for member benefit.', socials: { linkedin: '#', facebook: '#' } },
    { name: 'Ana Reyes', role: 'Auditor', initials: 'AR', description: 'Ensures transparency and compliance in all club financial and operational processes.', socials: { github: '#', facebook: '#' } },
    { name: 'Carlos M.', role: 'Dev Team Lead', initials: 'CM', description: 'Leads the development of club tools — registration system, ID cards, and internal dashboards.', socials: { github: '#', linkedin: '#' } },
  ],
  '24-25-2': [
    { name: 'Aldrin Joshua S.', role: 'President', initials: 'AJ', description: 'Leads the club into its second year. Expanding workshop offerings and deepening AWS partnership.', socials: { github: '#', linkedin: '#', facebook: '#' } },
    { name: 'Maria Santos', role: 'Vice President', initials: 'MS', description: 'Oversees departments and ensures alignment with club vision across all initiatives.', socials: { github: '#', linkedin: '#' } },
    { name: 'Juan Dela Cruz', role: 'Secretary', initials: 'JC', description: 'Maintains club records and coordinates inter-department communication.', socials: { linkedin: '#', facebook: '#' } },
    { name: 'Ana Reyes', role: 'Treasurer', initials: 'AR', description: 'Handles budget planning and AWS credit distribution for workshops and events.', socials: { github: '#', facebook: '#' } },
    { name: 'Carlos M.', role: 'Dev Team Lead', initials: 'CM', description: 'Shipping club tools and mentoring new dev team members.', socials: { github: '#', linkedin: '#' } },
    { name: 'Rosa D.', role: 'Skill Builder Lead', initials: 'RD', description: 'Designs workshop curricula and certification study paths for members.', socials: { linkedin: '#', facebook: '#' } },
  ],
}

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

export default function LandingPage() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [selectedTerm, setSelectedTerm] = useState('24-25-1')
  const [termOpen, setTermOpen] = useState(false)
  const [highlightedMember, setHighlightedMember] = useState<TeamMember | null>(null)

  // Cycle accent color every 10 seconds
  useEffect(() => {
    const colors = ['#44b3fe', '#4ADE80', '#AE5CFF', '#FF9900']
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % colors.length
      document.documentElement.style.setProperty('--blue', colors[index])
    }, 10000)
    return () => {
      clearInterval(interval)
      document.documentElement.style.setProperty('--blue', '#44b3fe')
    }
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <img src="/sbg-logo-white.svg" alt="" className="w-5 h-5" />
            <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>AWS Student Builder Group - PUP Biñan</span>
          </button>
          <div className="hidden md:flex items-center gap-5">
            {NAV.map(item => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="text-[11px] transition-colors" style={{ color: 'var(--muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>{item}</button>
            ))}
            <ThemeToggle />
            <button onClick={() => navigate('/register')} className="btn btn--primary" style={{ fontSize: '11px', padding: '7px 16px' }}>
              Join <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setMobileOpen(v => !v)} style={{ color: 'var(--muted)' }}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
            <div className="px-5 py-3 space-y-1">
              {NAV.map(item => (
                <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="block w-full text-left px-3 py-2 text-sm" style={{ color: 'var(--muted)' }}>{item}</button>
              ))}
              <button onClick={() => { navigate('/register'); setMobileOpen(false) }} className="w-full mt-2 btn btn--primary justify-center" style={{ fontSize: '12px' }}>Join</button>
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ background: 'var(--blue)', paddingTop: '5rem' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="max-w-xl">
              <p className="text-xs font-semibold mb-4" style={{ color: 'rgba(12,15,20,0.5)' }}>AWS Student Builder Group — PUP Biñan</p>
              <div className="relative">
                <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[1.02] tracking-tighter" style={{ color: '#0c0f14' }}>
                  IT'S ALWAYS<br />
                  DAY ONE
                </h1>
                <AWSSmile className="absolute -bottom-3 -right-4 w-12 h-6 sm:w-16 sm:h-8 lg:w-20 lg:h-10" style={{ color: '#0c0f14' }} />
              </div>
              <p className="text-sm sm:text-base mt-5 max-w-lg leading-relaxed" style={{ color: 'rgba(12,15,20,0.7)' }}>
                A student-run cloud club at PUP Biñan. 60+ members learning, building, and shipping on real AWS infrastructure — together.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button onClick={() => navigate('/register')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all"
                  style={{ background: '#0c0f14', color: '#fff', border: '1px solid #0c0f14' }}>
                  Apply for Membership <ArrowUpRight size={14} />
                </button>
                <button onClick={() => scrollTo('about')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all"
                  style={{ background: 'transparent', color: '#0c0f14', border: '1px solid rgba(12,15,20,0.25)' }}>
                  What we do
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden" style={{ border: '1px solid rgba(12,15,20,0.15)' }}>
                <img
                  src="/group-picture.jpg"
                  alt="SBG Group Photo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      const fallback = document.createElement('div')
                      fallback.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(12,15,20,0.05);font-size:0.875rem;text-align:center;padding:2rem;color:rgba(12,15,20,0.4);font-weight:600;'
                      fallback.textContent = 'SBG Group Photo'
                      parent.appendChild(fallback)
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TERMINAL STATS ══ */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 -mt-8 relative z-10">
        <div style={{ border: '1px solid var(--line)', background: 'var(--card)' }}>
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b" style={{ borderColor: 'var(--line)' }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--orange)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--blue)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--line)' }} />
            <span className="text-[10px] ml-2" style={{ color: 'var(--muted)' }}>sbg@status:~$</span>
          </div>
          <div className="px-4 py-3.5 sm:px-6 sm:py-4 font-mono text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
            <span style={{ color: 'var(--orange)' }}>$</span> ./club --status<br />
            <span style={{ color: 'var(--muted)' }}>  &gt; members:  <span style={{ color: 'var(--orange)' }}>63</span></span><br />
            <span style={{ color: 'var(--muted)' }}>  &gt; events:   <span style={{ color: 'var(--orange)' }}>12</span> /year</span><br />
            {/* <span style={{ color: 'var(--muted)' }}>  &gt; projects: <span style={{ color: 'var(--blue)' }}>8</span> shipped</span><br /> */}
            <span style={{ color: 'var(--muted)' }}>  &gt; founded:  <span style={{ color: 'var(--blue)' }}>2026</span></span><br />
            <span style={{ color: 'var(--orange)' }}>$</span> <span className="animate-pulse">_</span>
          </div>
        </div>
      </section>

      {/* ══ MISSION & VISION ══ */}
      <section id="about" className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-20 lg:pt-24">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--orange)' }}>About</p>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
          Why we exist.
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 mt-8">
          <div className="p-6 sm:p-7" style={{ border: '1px solid var(--line)', background: 'var(--card)' }}>
            <span className="block w-8 h-1 mb-4" style={{ background: 'var(--orange)' }} />
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--orange)' }}>Mission</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              To empower students to master cloud technology through collaboration, hands-on practice, and community. We bridge the gap between classroom theory and real-world cloud engineering.
            </p>
          </div>
          <div className="p-6 sm:p-7" style={{ border: '1px solid var(--line)', background: 'var(--card)' }}>
            <span className="block w-8 h-1 mb-4" style={{ background: 'var(--blue)' }} />
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--blue)' }}>Vision</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              To be the leading student-run cloud computing community in the Philippines — building a generation of cloud-ready graduates who are confident, certified, and connected.
            </p>
          </div>
        </div>
      </section>

      {/* ══ CLUB STORY ══ */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="p-4" style={{ border: '1px solid var(--line)', background: 'color-mix(in srgb, var(--orange) 4%, transparent)' }}>
              <img
                src="/My picture.jpg"
                alt="John Lexter Reyes"
                className="w-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) parent.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;font-weight:700;color:var(--orange)">JR</div>'
                }}
              />
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--orange)' }}>Origin Story</p>
            <p className="text-[clamp(1.8rem,3.5vw,3rem)] font-bold leading-[1.08] tracking-tighter mb-6" style={{ color: 'var(--text)' }}>
              No tech club?<br />
              <span style={{ color: 'var(--orange)' }}>Now there is.</span>
            </p>
            <p className="text-sm leading-relaxed max-w-lg" style={{ color: 'var(--muted)' }}>
              It started with a "how?" — how do I find more tech events like this? "Just join your university's tech club," they said. Only problem: we didn't have one. So I stopped asking "why not" and just executed it. Now there is one.
            </p>
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--line)' }}>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>John Lexter Reyes</span>
                <br />Founder &amp; President
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PIPELINE ══ */}
      <section style={{ background: 'var(--card)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--blue)' }}>Pipeline</p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>From zero to leading.</h2>
          <div className="flex flex-col md:flex-row" style={{ borderTop: '1px solid var(--line)' }}>
            {[
              ['01', 'Join', '5-minute application. Digital ID card. Discord + org channels.', 'var(--orange)'],
              ['02', 'Learn', 'Workshops, study groups, curated paths from Cloud Practitioner to SA.', 'var(--blue)'],
              ['03', 'Build', 'Real AWS projects. Hackathons, build nights, team sprints.', 'var(--orange)'],
              ['04', 'Lead', 'Mentor, run workshops, become an officer. Shape the club.', 'var(--blue)'],
            ].map(([num, title, desc, color], i) => (
              <div key={num} className="flex-1 p-6 md:p-8" style={{
                borderBottom: '1px solid var(--line)',
                borderRight: i < 3 ? '1px solid var(--line)' : 'none',
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg font-bold" style={{ color }}>{num}</span>
                  <span className="w-6 h-px" style={{ background: color }} />
                  <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color }}>{title}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROJECTS ══ */}
      {/* <section id="projects">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--orange)' }}>Projects</p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>What we've shipped.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROJECTS.map((proj, i) => {
              const accent = i % 2 === 0 ? 'var(--orange)' : 'var(--blue)'
              return (
                <div key={proj.title} style={{ border: '1px solid var(--line)', background: 'var(--card)' }}>
                  <div className="p-5 sm:p-6 flex flex-col items-center justify-center text-center min-h-[160px]">
                    <div className="w-8 h-8 mb-3 rounded-full flex items-center justify-center" style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)` }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>{proj.title}</h3>
                    <span className="text-[10px] px-2 py-0.5" style={{ background: `color-mix(in srgb, ${accent} 8%, transparent)`, color: accent }}>
                      {proj.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section> */}

      {/* ══ EVENTS ══ */}
      {/* <section id="events" style={{ background: 'var(--card)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--orange)' }}>Events</p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>Upcoming.</h2>
          <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--line) transparent' }}>
            <div className="flex gap-4 min-w-[700px]">
              {EVENTS.map(([title, date, time, loc, desc, fill, cap, tag]) => {
                const typeColors: Record<string, string> = { Workshop: 'var(--orange)', Talk: 'var(--blue)', Hackathon: 'var(--orange)', Study: 'var(--blue)' }
                const accent = typeColors[tag] || 'var(--orange)'
                const pct = Math.round((fill as number) / (cap as number) * 100)
                return (
                  <div key={title} className="flex-1 min-w-[240px] flex flex-col" style={{ border: '1px solid var(--line)', background: 'var(--bg)' }}>
                    <div style={{ background: accent }} className="px-4 py-2 flex items-center justify-between">
                      <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#0c0f14' }}>{tag}</span>
                      <span className="text-[9px] font-semibold" style={{ color: 'rgba(12,15,20,0.6)' }}>{date}</span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
                      <p className="text-xs leading-relaxed mb-3 flex-1" style={{ color: 'var(--muted)' }}>{desc}</p>
                      <div className="flex items-center gap-2 text-[10px] mb-3" style={{ color: 'var(--muted)' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {time}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {loc}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1" style={{ background: 'var(--line)' }}>
                          <div className="h-full" style={{ width: `${pct}%`, background: pct > 70 ? accent : 'var(--blue)' }} />
                        </div>
                        <span className="text-[10px] shrink-0" style={{ color: 'var(--muted)' }}>{fill}/{cap}</span>
                        <button onClick={() => navigate('/register')}
                          className="btn shrink-0"
                          style={{ fontSize: '9px', padding: '4px 10px', border: `1px solid ${accent}`, color: accent }}>
                          Register <ArrowUpRight size={9} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section> */}

      {/* ══ GALLERY ══ */}
      <section id="gallery" className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--blue)' }}>Gallery</p>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>Past events captured.</h2>
        <div style={{ overflow: 'visible' }}>
          <div className="gallery-track" style={{ padding: '40px 0' }}>
            {[...PAST_EVENTS, ...PAST_EVENTS].map((ev, i) => {
              const colorMap: Record<string, [string, string, string]> = {
                Workshop: ['#FF9900', '#cc7a00', '#8a5200'],
                Talk: ['#44b3fe', '#1a8cd8', '#0d5a8a'],
                Hackathon: ['#AE5CFF', '#8B3FCC', '#5C2A88'],
                Study: ['#4ADE80', '#2EBE60', '#1A8A42'],
              }
              const [c1, c2, c3] = colorMap[ev.type] || colorMap.Talk
              const gradient = `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`
              return (
                <div key={`${ev.title}-${i}`} className="gallery-item shrink-0 w-[280px] sm:w-[320px] overflow-hidden cursor-pointer"
                  style={{ border: '1px solid var(--line)' }}>
                  <div style={{ background: ev.image ? undefined : gradient, height: '200px' }} className="relative flex flex-col justify-end p-4">
                    {ev.image && (
                      <img src={ev.image} alt={ev.title} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5" style={{ background: 'rgba(0,0,0,0.3)', color: '#fff' }}>{ev.type}</span>
                    </div>
                    <div className="absolute top-3 right-3" style={{ opacity: 0.5 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <p className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{ev.date}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color: '#fff' }}>{ev.title}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ MEET THE TEAM ══ */}
      {/* <section id="team" className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--orange)' }}>Leadership</p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
              Meet the Team
            </h2>
          </div>
          <div className="relative">
            <button
              onClick={() => setTermOpen(v => !v)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold"
              style={{ border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--text)' }}
            >
              {TEAM_TERMS.find(t => t.value === selectedTerm)?.label}
              <ChevronDown size={12} style={{ transform: termOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {termOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 min-w-[220px]" style={{ border: '1px solid var(--line)', background: 'var(--bg)' }}>
                {TEAM_TERMS.map(term => (
                  <button
                    key={term.value}
                    onClick={() => { setSelectedTerm(term.value); setTermOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                    style={{ color: selectedTerm === term.value ? 'var(--orange)' : 'var(--muted)', background: selectedTerm === term.value ? 'color-mix(in srgb, var(--orange) 5%, transparent)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--orange) 5%, transparent)'}
                    onMouseLeave={e => e.currentTarget.style.background = selectedTerm === term.value ? 'color-mix(in srgb, var(--orange) 5%, transparent)' : 'transparent'}
                  >
                    {term.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {highlightedMember && (
          <div className="mb-8 p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6 sm:gap-8" style={{ border: '2px solid var(--orange)', background: 'color-mix(in srgb, var(--orange) 4%, transparent)' }}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0 overflow-hidden" style={{ background: 'var(--orange)' }}>
              {highlightedMember.image ? (
                <img src={highlightedMember.image} alt={highlightedMember.name} className="w-full h-full object-cover"
                  onError={(e) => { const t = e.currentTarget; t.style.display = 'none'; const p = t.parentElement; if (p) { p.innerHTML = `<span style="font-size:2rem;font-weight:700;color:#0c0f14">${highlightedMember.initials}</span>` } }} />
              ) : (
                <span className="text-2xl font-bold" style={{ color: '#0c0f14' }}>{highlightedMember.initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--orange)' }}>Highlighted</p>
                  <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text)' }}>{highlightedMember.name}</h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{highlightedMember.role}</p>
                </div>
                <button onClick={() => setHighlightedMember(null)}
                  className="text-[10px] px-3 py-1.5 shrink-0 transition-colors"
                  style={{ border: '1px solid var(--line)', color: 'var(--muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--line-bright)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--line)' }}>
                  Clear
                </button>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed mt-3 max-w-lg" style={{ color: 'var(--muted)' }}>{highlightedMember.description}</p>
              <div className="flex items-center gap-3 mt-4">
                {highlightedMember.socials.github && (
                  <SocialIcon href={highlightedMember.socials.github} label="GitHub">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                  </SocialIcon>
                )}
                {highlightedMember.socials.linkedin && (
                  <SocialIcon href={highlightedMember.socials.linkedin} label="LinkedIn">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                  </SocialIcon>
                )}
                {highlightedMember.socials.facebook && (
                  <SocialIcon href={highlightedMember.socials.facebook} label="Facebook">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </SocialIcon>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {TEAM_MEMBERS[selectedTerm]?.map((member) => {
            const isHighlighted = highlightedMember?.name === member.name
            return (
              <button
                key={member.name}
                onClick={() => setHighlightedMember(isHighlighted ? null : member)}
                style={{
                  border: isHighlighted ? '2px solid var(--orange)' : '1px solid var(--line)',
                  background: isHighlighted ? 'color-mix(in srgb, var(--orange) 6%, transparent)' : 'var(--card)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'center',
                  width: '100%',
                }}
                onMouseEnter={e => { if (!isHighlighted) { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--orange) 3%, transparent)' } }}
                onMouseLeave={e => { if (!isHighlighted) { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--card)' } }}
              >
                <div className="aspect-square flex items-center justify-center overflow-hidden" style={{ background: 'color-mix(in srgb, var(--orange) 8%, transparent)' }}>
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover"
                      onError={(e) => { const t = e.currentTarget; t.style.display = 'none'; const p = t.parentElement; if (p) p.innerHTML = `<span style="font-size:1.1rem;font-weight:700;color:var(--orange)">${member.initials}</span>` }} />
                  ) : (
                    <span className="text-sm font-bold" style={{ color: 'var(--orange)' }}>{member.initials}</span>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="text-[10px] font-semibold leading-tight" style={{ color: 'var(--text)' }}>{member.name}</h3>
                  <p className="text-[8px] mt-0.5 leading-tight" style={{ color: 'var(--muted)' }}>{member.role}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section> */}

      {/* ══ QUOTE ══ */}
      <section style={{ background: 'var(--blue)' }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-16 text-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgba(12,15,20,0.2)' }} className="mx-auto mb-4">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote className="text-base sm:text-lg leading-relaxed font-semibold" style={{ color: '#0c0f14' }}>
            "Cloud x AI: Build. Power. Lead. — three motions,<br className="hidden sm:block" /> one community of student builders."
          </blockquote>
          <p className="text-sm mt-4" style={{ color: 'rgba(12,15,20,0.6)' }}>AWS Student Builder Group — PUP Bi&ntilde;an</p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-center mb-2" style={{ color: 'var(--orange)' }}>FAQ</p>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-8" style={{ color: 'var(--text)' }}>Common questions.</h2>
        <div style={{ borderTop: '1px solid var(--line)' }}>
          {FAQS.map(([q, a], i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--line)' }}>
              <button onClick={() => setFaqOpen(fao => fao === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-4 text-left">
                <span className="text-sm" style={{ color: 'var(--text)' }}>{q}</span>
                <ChevronSVG open={faqOpen === i} />
              </button>
              <div className={`grid transition-all duration-300 ${faqOpen === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <p className="text-sm pb-4 leading-relaxed" style={{ color: 'var(--muted)' }}>{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ background: 'var(--blue)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight" style={{ color: '#0c0f14' }}>
              Ready to build?
            </h2>
            <p className="text-sm mt-2" style={{ color: 'rgba(12,15,20,0.6)' }}>
              No experience needed. Just show up.
            </p>
          </div>
          <button onClick={() => navigate('/register')}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold transition-all shrink-0"
            style={{ background: '#0c0f14', color: '#fff', border: '1px solid #0c0f14' }}>
            Apply for Membership <ArrowUpRight size={14} />
          </button>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid var(--line)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <img src="/sbg-logo-white.svg" alt="" className="w-4 h-4" />
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text)' }}>AWS Student Builder Group - PUP Biñan</span>
              </div>
              <p className="text-[10px] leading-relaxed max-w-xs" style={{ color: 'var(--muted)' }}>
                AWS Student Builder Group — PUP Bi&ntilde;an. Founded 2026. 63+ members building on AWS.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Connect</p>
                <div className="flex flex-col gap-2">
                  {['GitHub', 'Discord', 'Facebook'].map(l => (
                    <a key={l} href="#" className="text-[10px] transition-colors" style={{ color: 'var(--muted)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Info</p>
                <div className="flex flex-col gap-2 text-[10px]" style={{ color: 'var(--muted)' }}>
                  <span>members: 63</span>
                  <span>events: 12/yr</span>
                  <span>projects: 8</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-8 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
            <span className="text-[9px]" style={{ color: 'var(--muted)' }}>&copy; 2026 AWS SBG — PUP Bi&ntilde;an</span>
            <span className="pixel-dot" />
            <span className="text-[9px]" style={{ color: 'var(--muted)' }}>Built by students, for students</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ChevronSVG({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function AWSSmile({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18 C12 26, 28 26, 38 12" />
      <path d="M32 4 L38 12 L44 6" />
      <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-center"
      style={{ width: '28px', height: '28px', border: '1px solid var(--line)', color: 'var(--muted)' }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--line-bright)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--line)' }}
      aria-label={label}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </a>
  )
}
