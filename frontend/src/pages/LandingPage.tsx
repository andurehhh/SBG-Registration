// frontend/src/pages/LandingPage.tsx
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CreditCard, Users, Award, Search } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-sbg-black flex flex-col">

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <img src="/sbg-logo.svg" alt="SBG" className="h-9 w-9" />
          <div>
            <p className="font-bold text-white text-sm leading-tight"> AWS Student Builder Group</p>
            <p className="text-sbg-text-muted text-xs">PUP Biñan Campus</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/id-finder')}
            className="font-mono text-sbg-text-muted text-sm hover:text-white transition-colors px-3 py-1.5"
          >
            Find my ID
          </button>
          <button
            onClick={() => navigate('/register')}
            className="font-mono text-sm bg-sbg-purple hover:bg-sbg-purple-light text-white px-4 py-2 rounded-[8px] transition-colors"
          >
            Register
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative grid-bg flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        {/* Decorative accent squares */}
        <div className="absolute top-10 left-12 w-4 h-4 bg-sbg-purple opacity-50" />
        <div className="absolute top-24 left-28 w-2 h-2 bg-sbg-purple-light opacity-30" />
        <div className="absolute top-16 right-16 w-3 h-3 bg-sbg-purple opacity-40" />
        <div className="absolute bottom-16 left-20 w-2 h-2 bg-sbg-purple opacity-35" />
        <div className="absolute bottom-24 right-12 w-4 h-4 bg-sbg-purple-light opacity-25" />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
          <span className="font-mono text-sbg-purple text-xs uppercase tracking-widest border border-sbg-purple/30 bg-sbg-purple/10 px-3 py-1 rounded-full">
            AWS Student Builder Group
          </span>

          <h1 className="font-mono text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Build. Learn.<br />
            <span className="text-sbg-purple">Belong.</span>
          </h1>

          <p className="text-sbg-text-muted text-base md:text-lg max-w-xl leading-relaxed">
            Join the official AWS Student Builder Group at PUP Biñan Campus. Get your digital membership ID and connect with fellow builders.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 font-mono text-sm bg-sbg-purple hover:bg-sbg-purple-light text-white px-6 py-3 rounded-[8px] transition-colors"
            >
              Apply for Membership
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/id-finder')}
              className="inline-flex items-center justify-center gap-2 font-mono text-sm border border-white/10 hover:border-sbg-purple/50 text-sbg-text hover:text-white px-6 py-3 rounded-[8px] transition-colors"
            >
              <Search className="w-4 h-4" />
              Find my ID Card
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-16 bg-sbg-navy border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-mono text-white text-2xl font-bold text-center mb-10">
            What you get as a member
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <CreditCard className="w-6 h-6 text-sbg-purple" />,
                title: 'Digital ID Card',
                desc: 'A personalized flippable digital membership card you can download and share.',
              },
              {
                icon: <Users className="w-6 h-6 text-sbg-purple" />,
                title: 'Builder Community',
                desc: 'Connect with students who share your passion for cloud and AWS technologies.',
              },
              {
                icon: <Award className="w-6 h-6 text-sbg-purple" />,
                title: 'Events & Workshops',
                desc: 'Get access to exclusive SBG events, hackathons, and AWS learning sessions.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-sbg-black border border-white/[0.08] rounded-[8px] p-6 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-[8px] bg-sbg-purple/10 border border-sbg-purple/20 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="font-mono text-white text-sm font-bold">{f.title}</h3>
                <p className="text-sbg-text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="px-6 py-12 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-4">
          <h2 className="font-mono text-white text-xl font-bold">Ready to join?</h2>
          <p className="text-sbg-text-muted text-sm">
            Applications are open. Fill out the form and we'll review your application.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 font-mono text-sm bg-sbg-purple hover:bg-sbg-purple-light text-white px-6 py-3 rounded-[8px] transition-colors"
          >
            Start your application
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-5 border-t border-white/[0.06] flex items-center justify-between">
        <p className="font-mono text-sbg-text-muted text-xs">
          © 2025 AWS Student Builder Group — PUP Biñan
        </p>
        <button
          onClick={() => navigate('/admin/login')}
          className="font-mono text-sbg-text-muted text-xs hover:text-white transition-colors"
        >
          Admin
        </button>
      </footer>

    </div>
  )
}
