// frontend/src/components/registration/SuccessState.tsx
import { CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useRegistrationStore } from '../../store/registration'

export function SuccessState() {
  const store = useRegistrationStore()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      <div className="w-16 h-16 flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <CheckCircle className="w-8 h-8" style={{ color: 'var(--accent, #2d9cdb)' }} />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
          Application Submitted!
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted, var(--text-secondary))' }}>
          Thank you, <span style={{ color: 'var(--text)' }} className="font-medium">{store.full_name}</span>!
        </p>
        <p className="text-sm max-w-sm" style={{ color: 'var(--muted, var(--text-secondary))' }}>
          We'll notify you at{' '}
          <span className="font-mono" style={{ color: 'var(--text)' }}>{store.email}</span>{' '}
          once your application is reviewed.
        </p>
      </div>

      <div className="p-4 w-full max-w-xs" style={{ background: 'var(--card)', border: '1px solid var(--line, var(--border))' }}>
        <p className="text-xs mb-1 font-mono" style={{ color: 'var(--muted, var(--text-secondary))' }}>STUDENT NUMBER</p>
        <p className="text-sm font-mono" style={{ color: 'var(--text)' }}>{store.student_number}</p>
      </div>

      <p className="text-xs max-w-xs" style={{ color: 'var(--muted, var(--text-secondary))' }}>
        Follow our <a href="https://www.facebook.com/profile.php?id=61584279257151" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #2d9cdb)' }}>Facebook page</a> for updates while you wait.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          onClick={() => navigate('/')}
          className="w-full"
        >
          Back to Home
        </Button>
        <Button
          variant="ghost"
          onClick={() => store.reset()}
          className="w-full"
        >
          Submit Another Application
        </Button>
      </div>
    </div>
  )
}
