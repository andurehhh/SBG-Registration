// frontend/src/pages/LandingPage.tsx
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CreditCard, Users, Award, Search } from 'lucide-react'
import { EventsCarousel, type CarouselItem } from '../components/ui/EventsCarousel'
import { SbgLogoDecor } from '../components/ui/SbgLogoDecor'

const EVENTS_DATA: CarouselItem[] = [
  {
    id: '1',
    image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1234567890/sbg_event_1.jpg',
    title: 'AWS Cloud Day 2025',
    description: 'Our members attended AWS Cloud Day and connected with industry professionals from across the region.',
  },
  {
    id: '2',
    image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1234567890/sbg_event_2.jpg',
    title: 'SBG Kickoff Event',
    description: 'The official launch of the AWS Student Builder Group at PUP Biñan Campus with 50+ attendees.',
  },
  {
    id: '3',
    image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1234567890/sbg_event_3.jpg',
    title: 'Cloud Workshop Series',
    description: 'Hands-on workshops covering AWS fundamentals, serverless architecture, and cloud security.',
  },
  {
    id: '4',
    image: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1234567890/sbg_event_4.jpg',
    title: 'Hackathon Winners',
    description: 'Our team placed in the top 3 at the inter-university AWS hackathon competition.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-6 py-5 bg-sbg-navy border-b border-white/[0.06]">
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
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
        {/* Large cropped logo — only one corner crop in the hero */}
        <div className="absolute -bottom-14 -right-10">
          <SbgLogoDecor size={180} color="#38BDF8" />
        </div>
        {/* Scattered small/medium logos at varying opacities for depth */}
        <div className="absolute top-12 left-8 opacity-20">
          <SbgLogoDecor size={44} color="#4ADE80" />
        </div>
        <div className="absolute top-20 right-24">
          <SbgLogoDecor size={28} color="#FB923C" />
        </div>
        <div className="absolute bottom-28 left-24 opacity-40">
          <SbgLogoDecor size={36} color="#AE5CFF" />
        </div>
        <div className="absolute top-1/2 left-6 opacity-15">
          <SbgLogoDecor size={52} color="#38BDF8" />
        </div>
        <div className="absolute bottom-12 left-32">
          <SbgLogoDecor size={22} color="#F87171" />
        </div>
        <div className="absolute top-32 left-1/3 opacity-10">
          <SbgLogoDecor size={60} color="#FB923C" />
        </div>
        <div className="absolute top-8 right-1/4 opacity-30">
          <SbgLogoDecor size={34} color="#AE5CFF" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
          <p className="text-sbg-text-muted text-sm font-mono uppercase tracking-widest">AWS Student Builder Group</p>
          <div className="w-12 h-1 bg-sbg-purple rounded-full" />

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
      <section className="relative px-6 py-16 bg-sbg-navy border-t border-white/[0.06] overflow-hidden">
        {/* Scattered logos — no corner crops here, just depth */}
        <div className="absolute top-6 right-12 opacity-25">
          <SbgLogoDecor size={48} color="#AE5CFF" />
        </div>
        <div className="absolute bottom-10 left-6">
          <SbgLogoDecor size={30} color="#38BDF8" />
        </div>
        <div className="absolute top-1/2 right-4 opacity-15">
          <SbgLogoDecor size={56} color="#4ADE80" />
        </div>
        <div className="absolute bottom-4 right-1/3 opacity-30">
          <SbgLogoDecor size={24} color="#AE5CFF" />
        </div>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-mono text-white text-2xl font-bold text-center mb-10">
            What you get as a member
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-6 h-6 text-sbg-purple" />,
                title: 'Builder Community',
                desc: 'Be part of a network of student builders passionate about cloud tech. Collaborate, share ideas, and grow together.',
              },
              {
                icon: <Award className="w-6 h-6 text-sbg-purple" />,
                title: 'Events & Workshops',
                desc: 'Hands-on workshops, hackathons, and speaker sessions with industry professionals and AWS experts.',
              },
              {
                icon: <CreditCard className="w-6 h-6 text-sbg-purple" />,
                title: 'Industry Tools & Perks',
                desc: 'Access AWS credits, learning resources, certifications pathways, and tools used by real-world engineers.',
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

      {/* ── Events & Achievements ── */}
      <section className="relative z-10 px-6 py-16 border-t border-white/[0.06] overflow-hidden">
        {/* One cropped logo — bottom-left corner */}
        <div className="absolute -bottom-10 -left-6">
          <SbgLogoDecor size={140} color="#FB923C" />
        </div>
        {/* Scattered for depth */}
        <div className="absolute top-8 right-10 opacity-20">
          <SbgLogoDecor size={40} color="#4ADE80" />
        </div>
        <div className="absolute top-1/3 left-4 opacity-30">
          <SbgLogoDecor size={32} color="#38BDF8" />
        </div>
        <div className="absolute bottom-20 right-6">
          <SbgLogoDecor size={22} color="#F87171" />
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-mono text-white text-2xl font-bold">Events & Achievements</h2>
            <p className="text-sbg-text-muted text-sm mt-2">
              Highlights from our community activities and milestones.
            </p>
          </div>
          <EventsCarousel items={EVENTS_DATA} />
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="relative px-6 py-12 bg-sbg-navy border-t border-white/[0.06] overflow-hidden">
        {/* Just scattered, no corners */}
        <div className="absolute top-4 left-10 opacity-20">
          <SbgLogoDecor size={38} color="#4ADE80" />
        </div>
        <div className="absolute bottom-3 right-8">
          <SbgLogoDecor size={24} color="#F87171" />
        </div>
        <div className="absolute top-1/2 right-16 opacity-15">
          <SbgLogoDecor size={44} color="#38BDF8" />
        </div>
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

      {/* ── Credits ── */}
      <section className="relative z-10 px-6 py-10 border-t border-white/[0.06] overflow-hidden">
        {/* Subtle scattered */}
        <div className="absolute top-3 right-6 opacity-25">
          <SbgLogoDecor size={28} color="#38BDF8" />
        </div>
        <div className="absolute bottom-2 left-10 opacity-20">
          <SbgLogoDecor size={32} color="#FB923C" />
        </div>
        <div className="max-w-md mx-auto text-center">
          <p className="text-sbg-text-muted text-xs font-mono uppercase tracking-widest mb-4">Built by</p>
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-sbg-navy-light border border-white/[0.08] flex items-center justify-center text-sm font-bold text-sbg-purple">
                A
              </div>
              <p className="text-white text-sm font-mono">Andre</p>
              <p className="text-sbg-text-muted text-xs">Developer</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-sbg-navy-light border border-white/[0.08] flex items-center justify-center text-sm font-bold text-sbg-purple">
                K
              </div>
              <p className="text-white text-sm font-mono">Kiro</p>
              <p className="text-sbg-text-muted text-xs">AI Engineer</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-5 bg-sbg-navy border-t border-white/[0.06] flex items-center justify-center">
        <p className="font-mono text-sbg-text-muted text-xs">
          © 2025 AWS Student Builder Group — PUP Biñan
        </p>
      </footer>

    </div>
  )
}
