// frontend/src/components/registration/StepApplicationQuestions.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { useRegistrationStore } from '../../store/registration'
import { registrationStep2Schema, type RegistrationStep2Data } from '../../lib/validations'

const HEARD_FROM_OPTIONS = [
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Classroom / Professor', label: 'Classroom / Professor' },
  { value: 'Friend / Classmate', label: 'Friend / Classmate' },
  { value: 'Partner Organization', label: 'Partner Organization' },
  { value: 'Other', label: 'Other' },
]

interface StepApplicationQuestionsProps {
  onNext: () => void
  onBack: () => void
}

export function StepApplicationQuestions({ onNext, onBack }: StepApplicationQuestionsProps) {
  const store = useRegistrationStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistrationStep2Data>({
    resolver: zodResolver(registrationStep2Schema),
    defaultValues: {
      why_join: store.why_join,
      expectations: store.expectations,
    },
  })

  const whyJoinValue = watch('why_join', store.why_join)
  const expectationsValue = watch('expectations', store.expectations)

  function onSubmit(data: RegistrationStep2Data) {
    store.setField('why_join', data.why_join)
    store.setField('expectations', data.expectations)
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Textarea
            label="Why do you wish to join the AWS Student Builder Group?"
            placeholder="Share your motivation for joining SBG..."
            minHeight="140px"
            error={errors.why_join?.message}
            {...register('why_join')}
          />
          <p className="text-xs text-sbg-text-muted text-right font-mono">
            {whyJoinValue.length} / 25 min
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Textarea
            label="What are you expecting from AWS Student Builder Group?"
            placeholder="Describe what you hope to gain from SBG..."
            minHeight="140px"
            error={errors.expectations?.message}
            {...register('expectations')}
          />
          <p className="text-xs text-sbg-text-muted text-right font-mono">
            {expectationsValue.length} / 25 min
          </p>
        </div>

        <Select
          label="How did you hear about us?"
          options={HEARD_FROM_OPTIONS}
          placeholder="Select an option"
          value={store.heard_from}
          onChange={(e) => store.setField('heard_from', e.target.value)}
        />
      </div>

      <div className="flex gap-3 mt-2">
        <Button type="button" variant="ghost" onClick={onBack} className="flex-1">
          ← Back
        </Button>
        <Button type="submit" className="flex-1">
          Next →
        </Button>
      </div>
    </form>
  )
}
