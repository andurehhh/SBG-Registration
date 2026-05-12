// frontend/src/pages/RegisterPage.tsx
import { BackButton } from '../components/ui/BackButton'
import { RegistrationForm } from '../components/registration/RegistrationForm'

export default function RegisterPage() {

  return (
    <div className="min-h-screen bg-sbg-black flex flex-col lg:flex-row">

      {/* ── Left panel: branding / hero ── */}
      <div className="relative lg:flex-1 grid-bg flex flex-col justify-between p-8 lg:p-12 min-h-[280px] lg:min-h-screen">
        {/* Purple accent squares */}
        <div className="absolute top-6 right-10 w-4 h-4 bg-sbg-purple opacity-60" />
        <div className="absolute top-16 right-20 w-2 h-2 bg-sbg-purple-light opacity-40" />
        <div className="absolute bottom-20 left-10 w-3 h-3 bg-sbg-purple opacity-50" />
        <div className="absolute bottom-10 right-16 w-2 h-2 bg-sbg-purple-light opacity-30" />

        {/* Back button + Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <BackButton to="/" label="Back to Home" />
          <div className="flex items-center gap-2">
            <img src="/sbg-logo.svg" alt="SBG Logo" className="h-8 w-8 flex-shrink-0" />
            <p className="font-bold text-white text-xs hidden sm:block">Student Builder Group</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 flex flex-col gap-6 my-auto py-12 lg:py-0">
          <div className="flex flex-col gap-3">
            <span className="text-sbg-purple font-mono text-xs uppercase tracking-widest">
              Membership Registration
            </span>
            <h1 className="font-bold text-white text-3xl lg:text-4xl xl:text-5xl leading-tight">
              Join the<br />Builder<br />Community
            </h1>
          </div>
          <p className="text-sbg-text-muted text-sm lg:text-base max-w-sm leading-relaxed">
            Apply for SBG membership and get your official digital membership ID card. Build, learn, and grow with AWS.
          </p>

          <ul className="flex flex-col gap-3 mt-2">
            {[
              'Official digital membership ID card',
              'Access to AWS learning resources',
              'Community events and workshops',
              'Builder network at PUP Biñan',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-sbg-text">
                <span className="w-1.5 h-1.5 rounded-full bg-sbg-purple flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <p className="text-sbg-text-muted text-xs">
            Powered by AWS · PUP Biñan Campus
          </p>
        </div>
      </div>

      {/* ── Right panel: registration form ── */}
      <div className="lg:flex-1 flex flex-col justify-center px-6 py-10 lg:px-12 lg:py-12 bg-sbg-black lg:overflow-y-auto">
        <div className="w-full max-w-lg mx-auto">
          <div className="mb-8">
            <h2 className="font-bold text-white text-2xl">Create your application</h2>
            <p className="text-sbg-text-muted text-sm mt-1">
              Fill out all three steps to complete your membership application.
            </p>
          </div>
          <RegistrationForm />
        </div>
      </div>

    </div>
  )
}
