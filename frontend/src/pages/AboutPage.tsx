// frontend/src/pages/AboutPage.tsx
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useInView } from '../lib/useInView'

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={`${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700 ease-out ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

const DEPARTMENTS = [
  { num: '01', title: 'Dev Team', desc: 'Builds and maintains club tools — the registration system, ID card generator, and internal dashboards.' },
  { num: '02', title: 'Skill Builder Dept', desc: 'Plans workshops, study groups, and certification prep tracks for members at every level.' },
  { num: '03', title: 'Core Team', desc: 'Officers handling operations, outreach, partnerships, and keeping the club running.' },
]

const OFFICERS = [
  { name: 'Aldrin Joshua S.', role: 'President', initials: 'AJ' },
  { name: 'Maria Santos', role: 'Vice President', initials: 'MS' },
  { name: 'Juan Dela Cruz', role: 'Secretary', initials: 'JC' },
  { name: 'Ana Reyes', role: 'Treasurer', initials: 'AR' },
]

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-sbg-black">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-5 bg-sbg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <img src="/sbg-logo-white.svg" alt="SBG" className="h-7 w-7" />
          <span className="font-sans font-bold text-white text-sm tracking-tight">SBG</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/')} className="text-sbg-text-muted text-sm hover:text-white transition-colors">Home</button>
          <button onClick={() => navigate('/register')} className="bg-sbg-accent text-sbg-black px-5 py-2 rounded text-sm font-semibold hover:brightness-110 transition-all">Join</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/[0.06]">
            <Reveal className="lg:col-span-12 bg-sbg-surface p-8 lg:p-12 pt-32">
              <p className="text-sbg-text-muted text-xs mb-4 font-mono">About Us</p>
              <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight leading-[1.1] max-w-3xl">
                Built by students,<br />for students.
              </h1>
              <p className="text-sbg-text-muted text-lg mt-6 max-w-lg leading-relaxed">
                The official AWS Student Builder Group at PUP Biñan — a community
                of cloud enthusiasts, builders, and learners.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.06]">
            <Reveal>
              <div className="bg-sbg-surface p-8 lg:p-12">
                <p className="text-sbg-text-muted text-xs mb-4 font-mono">Mission</p>
                <p className="text-sbg-text-muted text-base leading-relaxed">
                  To empower students to master cloud technology through
                  collaboration, hands-on practice, and community. We bridge the
                  gap between classroom theory and real-world cloud engineering.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="bg-sbg-surface p-8 lg:p-12">
                <p className="text-sbg-text-muted text-xs mb-4 font-mono">Vision</p>
                <p className="text-sbg-text-muted text-base leading-relaxed">
                  To be the leading student-run cloud computing community in the
                  Philippines — building a generation of cloud-ready graduates who
                  are confident, certified, and connected.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/[0.06]">
            <Reveal className="lg:col-span-5 bg-sbg-surface p-8 lg:p-12">
              <div className="sticky top-32">
                <p className="text-sbg-text-muted text-xs mb-4 font-mono">01 / Origin</p>
                <h2 className="text-white text-3xl md:text-4xl font-sans font-bold tracking-tight mb-4">
                  Started with a question:
                </h2>
                <blockquote className="text-white text-xl md:text-2xl font-sans font-bold leading-snug">
                  "Why don't we have a cloud club?"
                </blockquote>
              </div>
            </Reveal>

            <Reveal delay={150} className="lg:col-span-7 bg-sbg-surface p-8 lg:p-12">
              <div className="space-y-4 text-sbg-text-muted text-base leading-relaxed">
                <p>
                  It started with a "how?" — how do we find more tech events like
                  this? "Just join your university's tech club," they said. Only
                  problem: we didn't have one.
                </p>
                <p>
                  So we stopped asking "why not" and just executed it. That "how?"
                  grew into the first student-run cloud computing organization at
                  PUP Biñan Campus.
                </p>
                <p>
                  Today, SBG runs workshops, study groups, and project sprints
                  every semester. We've helped students earn their first AWS
                  certifications, deployed real applications on the cloud, and
                  kept building the community we wished we had from the start.
                </p>
              </div>

              {/* Founder card */}
              <div className="border border-white/[0.06] mt-10">
                <div className="grid grid-cols-12 gap-px bg-white/[0.06]">
                  <div className="col-span-3 bg-sbg-surface p-6 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="text-white font-sans font-bold text-sm">AJ</span>
                    </div>
                  </div>
                  <div className="col-span-9 bg-sbg-surface p-6">
                    <p className="text-white font-sans font-bold text-sm">Aldrin Joshua S.</p>
                    <p className="text-sbg-text-muted text-xs mt-1 font-mono">Founder & First President</p>
                    <p className="text-sbg-text-muted text-sm mt-3 italic leading-relaxed">
                      "I wanted to create a space where students don't just learn cloud — they live it."
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Departments ── */}
      <section className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-px bg-white/[0.06]">
            <Reveal className="bg-sbg-surface p-8 lg:p-12">
              <p className="text-sbg-text-muted text-xs mb-2 font-mono">02 / Structure</p>
              <h2 className="text-white text-3xl md:text-4xl font-sans font-bold tracking-tight">
                Our Departments
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06]">
              {DEPARTMENTS.map((dept, i) => (
                <Reveal key={dept.title} delay={i * 100}>
                  <div className="bg-sbg-surface p-8 lg:p-10 hover:bg-sbg-surface-raised transition-colors">
                    <p className="text-sbg-text-muted text-sm font-bold mb-4 font-mono">{dept.num}</p>
                    <h3 className="text-white text-xl font-sans font-bold mb-3">{dept.title}</h3>
                    <p className="text-sbg-text-muted text-sm leading-relaxed">{dept.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Officers ── */}
      <section className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-px bg-white/[0.06]">
            <Reveal className="bg-sbg-surface p-8 lg:p-12">
              <p className="text-sbg-text-muted text-xs mb-2 font-mono">03 / Leadership</p>
              <h2 className="text-white text-3xl md:text-4xl font-sans font-bold tracking-tight">
                Meet the Officers
              </h2>
            </Reveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06]">
              {OFFICERS.map((officer, i) => (
                <Reveal key={officer.name} delay={i * 80}>
                  <div className="bg-sbg-surface p-8 text-center">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-sans font-bold">{officer.initials}</span>
                    </div>
                    <h3 className="text-white text-sm font-sans font-bold">{officer.name}</h3>
                    <p className="text-sbg-text-muted text-xs mt-1">{officer.role}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/[0.06]">
            <Reveal className="lg:col-span-8 bg-sbg-surface p-8 lg:p-16">
              <h2 className="text-white text-5xl md:text-6xl font-sans font-bold tracking-tight leading-[1.05]">
                Ready to<br />build?
              </h2>
              <div className="flex flex-wrap gap-4 mt-8">
                <button onClick={() => navigate('/register')} className="inline-flex items-center gap-2 bg-sbg-accent text-sbg-black px-7 py-3.5 rounded text-sm font-semibold hover:brightness-110 transition-all">
                  Join the Club <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </Reveal>

            <div className="lg:col-span-4 bg-sbg-surface p-8 lg:p-12 flex flex-col justify-center">
              <p className="text-sbg-text-muted text-xs mb-4 font-mono">PUP Biñan Campus</p>
              <p className="text-white/40 text-sm leading-relaxed">
                Applications are open for new and returning members. AY 2026-2027.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 lg:px-12 py-8 border-t border-white/[0.06]">
        <div className="max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sbg-text-muted text-xs">
            © 2026 AWS Student Builder Group — PUP Biñan
          </p>
          <div className="flex items-center gap-6">
            {['GitHub', 'Discord', 'Facebook', 'Email'].map((l) => (
              <a key={l} href="#" className="text-sbg-text-muted hover:text-white transition-colors text-xs">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
