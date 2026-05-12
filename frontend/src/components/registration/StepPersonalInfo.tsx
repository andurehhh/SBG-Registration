// frontend/src/components/registration/StepPersonalInfo.tsx
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { useRegistrationStore } from '../../store/registration'
import { registrationStep1Schema, AWS_INTERESTS, type RegistrationStep1Data } from '../../lib/validations'
import { api, ApiError } from '../../lib/api'
import type { Gender } from '../../types'

const COURSE_OPTIONS = [
  { value: 'BSIT', label: 'BS Information Technology' },
  { value: 'BSIE', label: 'BS Industrial Engineering' },
  { value: 'BSCE', label: 'BS Computer Engineering' },
  { value: 'Other', label: 'Other' },
]

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'NonBinary', label: 'Non-binary' },
  { value: 'PreferNotToSay', label: 'Prefer not to say' },
]

const YEAR_OPTIONS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
  { value: '5', label: 'Ladderized' },
]

interface StepPersonalInfoProps {
  onNext: () => void
}

export function StepPersonalInfo({ onNext }: StepPersonalInfoProps) {
  const store = useRegistrationStore()
  const [otherCourse, setOtherCourse] = useState(
    store.course && !['BSIT', 'BSIE', 'BSCE'].includes(store.course) ? store.course : ''
  )

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationStep1Data>({
    resolver: zodResolver(registrationStep1Schema),
    defaultValues: {
      full_name: store.full_name,
      student_number: store.student_number,
      course: store.course,
      year_level: store.year_level ?? undefined,
      section: store.section,
      email: store.email,
      scholar_email: store.scholar_email,
      gender: store.gender as Gender,
      skills: store.skills,
    },
  })

  const selectedCourse = watch('course')

  async function onSubmit(data: RegistrationStep1Data) {
      // Check for duplicate student number — only block if pending or approved
      // Inactive and rejected members are allowed to re-register
      try {
        const result = await api.get<{ status: string }>(`/api/members/lookup?student_number=${encodeURIComponent(data.student_number)}`)
        if (result.success) {
          // Member is approved and active — block
          setError('student_number', {
            message: 'This student number already has an active membership.',
          })
          return
        }
        if (!result.success) {
          const status = result.error
          if (status === 'pending') {
            setError('student_number', {
              message: 'This student number already has a pending application.',
            })
            return
          }
          // 'inactive', 'rejected', 'removed' — allow re-registration, fall through
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // Not found — good, proceed
        } else if (err instanceof ApiError && err.status === 429) {
          setError('student_number', { message: 'Too many requests. Please try again later.' })
          return
        }
        // Other errors — proceed anyway
      }

    // Save to store
    store.setField('full_name', data.full_name)
    store.setField('student_number', data.student_number)
    store.setField('course', data.course)
    store.setField('year_level', data.year_level)
    store.setField('section', data.section)
    store.setField('email', data.email)
    store.setField('scholar_email', data.scholar_email)
    store.setField('gender', data.gender)
    store.setField('skills', data.skills)

    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Full Name"
          placeholder="Juan dela Cruz"
          error={errors.full_name?.message}
          {...register('full_name')}
        />

        <Input
          label="Student Number"
          placeholder="2024-12345-BN-0"
          error={errors.student_number?.message}
          {...register('student_number')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="course"
            control={control}
            render={({ field }) => (
              <Select
                label="Course"
                options={COURSE_OPTIONS}
                placeholder="Select course"
                error={errors.course?.message}
                {...field}
                onChange={(e) => {
                  field.onChange(e)
                  if (e.target.value !== 'Other') setOtherCourse('')
                }}
              />
            )}
          />

          <Controller
            name="year_level"
            control={control}
            render={({ field }) => (
              <Select
                label="Year Level"
                options={YEAR_OPTIONS}
                placeholder="Select year"
                error={errors.year_level?.message}
                value={field.value?.toString() ?? ''}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
              />
            )}
          />
        </div>

        {selectedCourse === 'Other' && (
          <Input
            label="Specify your course"
            placeholder="e.g. BS Civil Engineering"
            value={otherCourse}
            onChange={(e) => {
              setOtherCourse(e.target.value)
              setValue('course', e.target.value, { shouldValidate: true })
            }}
            error={selectedCourse === 'Other' && !otherCourse ? 'Please specify your course' : undefined}
          />
        )}

        <Input
          label="Year and Section"
          placeholder="BSIT-3A"
          error={errors.section?.message}
          {...register('section')}
        />

        <Input
          label="Personal Email"
          type="email"
          placeholder="juan@gmail.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="PUP Webmail"
          type="email"
          placeholder="juandelacruz@iskolarngbayan.pup.edu.ph"
          hint="Format: YourFullName@iskolarngbayan.pup.edu.ph"
          error={errors.scholar_email?.message}
          {...register('scholar_email')}
        />

        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select
              label="Gender"
              options={GENDER_OPTIONS}
              placeholder="Select gender"
              error={errors.gender?.message}
              {...field}
            />
          )}
        />

        {/* AWS Interests multi-select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-mono text-sbg-text-muted">
            AWS Interests <span className="text-red-400">*</span>
          </label>
          <Controller
            name="skills"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {AWS_INTERESTS.map((interest) => {
                  const isSelected = field.value.includes(interest)
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => {
                        const next = isSelected
                          ? field.value.filter((s) => s !== interest)
                          : [...field.value, interest]
                        field.onChange(next)
                      }}
                      className={[
                        'px-3 py-1.5 rounded-[8px] text-xs font-mono border transition-colors',
                        isSelected
                          ? 'bg-sbg-purple border-sbg-purple text-white'
                          : 'bg-sbg-navy-light border-white/10 text-sbg-text-muted hover:border-sbg-purple/50',
                      ].join(' ')}
                    >
                      {interest}
                    </button>
                  )
                })}
              </div>
            )}
          />
          {errors.skills && (
            <p className="text-xs text-red-400 font-mono">{errors.skills.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" loading={isSubmitting} className="w-full mt-2">
        Next →
      </Button>
    </form>
  )
}
