// frontend/src/components/registration/SuccessState.tsx
import { CheckCircle, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useRegistrationStore } from '../../store/registration'

export function SuccessState() {
  const store = useRegistrationStore()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-700/50 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-400" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-mono text-white text-xl font-bold">
          Application Submitted!
        </h2>
        <p className="text-sbg-text-muted text-sm">
          Thank you, <span className="text-white font-medium">{store.full_name}</span>!
        </p>
        <p className="text-sbg-text-muted text-sm max-w-sm">
          We'll notify you at{' '}
          <span className="text-sbg-purple font-mono">{store.email}</span>{' '}
          once your application is reviewed.
        </p>
      </div>

      <div className="p-4 rounded-[8px] bg-sbg-navy-light border border-white/[0.08] w-full max-w-xs">
        <p className="text-xs font-mono text-sbg-text-muted mb-1">STUDENT NUMBER</p>
        <p className="font-mono text-white text-sm">{store.student_number}</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          icon={<Search className="w-4 h-4" />}
          onClick={() => navigate('/id-finder')}
          className="w-full"
        >
          Check my ID Card
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
