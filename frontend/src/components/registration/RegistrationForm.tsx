// frontend/src/components/registration/RegistrationForm.tsx
import { useState, useEffect } from 'react'
import { FlipCard } from './FlipCard'
import { ProgressBar } from './ProgressBar'
import { StepPersonalInfo } from './StepPersonalInfo'
import { StepApplicationQuestions } from './StepApplicationQuestions'
import { StepAttachments } from './StepAttachments'
import { SuccessState } from './SuccessState'
import { Card } from '../ui/Card'
import { useRegistrationStore } from '../../store/registration'
import { getRegistrationOpen } from '../../lib/appConfig'

export function RegistrationForm() {
  const store = useRegistrationStore()
  const [isFlipped, setIsFlipped] = useState(false)
  const [pendingStep, setPendingStep] = useState<1 | 2 | 3 | null>(null)
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)

  // Fetch registration open/closed status from database
  useEffect(() => {
    getRegistrationOpen()
      .then(setRegistrationOpen)
      .finally(() => setIsLoadingConfig(false))
  }, [])

  if (store.submissionStatus === 'success') {
    return (
      <Card>
        <SuccessState />
      </Card>
    )
  }

  // Loading config state
  if (isLoadingConfig) {
    return (
      <Card>
          <div className="flex items-center justify-center py-12">
            <div className="font-mono text-xs text-sbg-text-muted">
              <span className="text-sbg-accent">$</span> loading...
            </div>
          </div>
      </Card>
    )
  }

  // Registration closed state
  if (!registrationOpen) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center gap-4 py-8">
          <div className="w-14 h-14 flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <span className="text-2xl">🔒</span>
          </div>
          <div>
            <h3 className="font-sans text-sbg-text text-lg font-bold">Registration Closed</h3>
            <p className="text-sbg-text-muted text-sm mt-2 max-w-xs">
              Applications are not currently being accepted. Please check back later or contact the SBG team.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  function goToStep(step: 1 | 2 | 3) {
    setPendingStep(step)
    setIsFlipped((prev) => !prev)
  }

  function handleFlipEnd() {
    if (pendingStep !== null) {
      store.goToStep(pendingStep)
      setPendingStep(null)
    }
  }

  const currentContent = renderStep(store.currentStep)
  const nextContent = pendingStep ? renderStep(pendingStep) : null

  function renderStep(step: 1 | 2 | 3) {
    switch (step) {
      case 1: return <StepPersonalInfo onNext={() => goToStep(2)} />
      case 2: return <StepApplicationQuestions onNext={() => goToStep(3)} onBack={() => goToStep(1)} />
      case 3: return <StepAttachments onBack={() => goToStep(2)} />
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="font-sans text-sbg-text text-lg font-bold">
            {store.currentStep === 1 && 'Personal Information'}
            {store.currentStep === 2 && 'Application Questions'}
            {store.currentStep === 3 && 'Attachments'}
          </h2>
        </div>
        <FlipCard
          front={currentContent}
          back={nextContent ?? currentContent}
          isFlipped={isFlipped}
          onFlipEnd={handleFlipEnd}
        />
        <ProgressBar current={store.currentStep} total={3} />
      </div>
    </Card>
  )
}
