// frontend/src/components/registration/SuccessState.tsx
import { CheckCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { useRegistrationStore } from '../../store/registration'

const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || '/'

export function SuccessState() {
  const store = useRegistrationStore()

  return (
    <div className="flex flex-col items-center text-center gap-5 py-6">
      <div className="w-14 h-14 flex items-center justify-center rounded-full" style={{ background: 'var(--accent-dim, rgba(45,156,219,0.1))' }}>
        <CheckCircle className="w-7 h-7" style={{ color: 'var(--accent, #2d9cdb)' }} />
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
          Application Submitted!
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Thank you, <span style={{ color: 'var(--text)' }} className="font-semibold">{store.full_name}</span>. We've received your application.
        </p>
      </div>

      {/* Student number receipt */}
      <div className="p-3 w-full max-w-xs rounded-lg" style={{ background: 'var(--bg-raised, rgba(0,0,0,0.03))', border: '1px solid var(--border)' }}>
        <p className="text-[10px] mb-0.5 font-mono uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Student Number</p>
        <p className="text-sm font-mono font-semibold" style={{ color: 'var(--text)' }}>{store.student_number}</p>
      </div>

      {/* What happens next */}
      <div className="w-full max-w-sm text-left rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-4 py-2" style={{ background: 'var(--accent)', color: 'white' }}>
          <p className="text-xs font-bold">What happens next</p>
        </div>
        <div className="p-4 space-y-2.5" style={{ background: 'var(--bg-raised, transparent)' }}>
          {[
            ['1', `We'll email a confirmation to ${store.email}.`],
            ['2', 'Our team reviews your application within 3–5 days.'],
            ['3', 'If approved, you\'ll get your digital membership ID and an invite to orientation.'],
          ].map(([n, text]) => (
            <div key={n} className="flex gap-2.5">
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5" style={{ background: 'var(--accent-dim, rgba(45,156,219,0.15))', color: 'var(--accent-dark, #1a7bb5)' }}>{n}</span>
              <span className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Help */}
      <p className="text-[11px] max-w-sm" style={{ color: 'var(--text-secondary)' }}>
        Questions? Message us on{' '}
        <a href="https://www.facebook.com/profile.php?id=61584279257151" target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: 'var(--accent, #2d9cdb)' }}>Facebook</a>{' '}
        or email{' '}
        <a href="mailto:sbg.pupbinan@gmail.com" className="font-semibold" style={{ color: 'var(--accent, #2d9cdb)' }}>sbg.pupbinan@gmail.com</a>.
      </p>

      <div className="flex flex-col gap-2.5 w-full max-w-xs">
        <a href={MARKETING_URL} className="w-full">
          <Button className="w-full">Back to Site</Button>
        </a>
        <Button variant="ghost" onClick={() => store.reset()} className="w-full">
          Submit Another Application
        </Button>
      </div>
    </div>
  )
}
