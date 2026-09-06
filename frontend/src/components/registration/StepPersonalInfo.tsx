// frontend/src/components/registration/StepPersonalInfo.tsx
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { useRegistrationStore } from '../../store/registration'
import { registrationStep1Schema, AWS_INTERESTS, type RegistrationStep1Data } from '../../lib/validations'
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

const SECTION_OPTIONS = [
  { value: '1', label: 'Section 1' },
  { value: '2', label: 'Section 2' },
]

interface StepPersonalInfoProps {
  onNext: () => void
}

const PRESET_COURSES = ['BSIT', 'BSIE', 'BSCE']

export function StepPersonalInfo({ onNext }: StepPersonalInfoProps) {
  const store = useRegistrationStore()

  // Is the stored course a preset, or a custom "Other" value?
  const storedIsOther = !!store.course && !PRESET_COURSES.includes(store.course)

  // The dropdown selection is tracked separately from the actual course value,
  // so typing in the "Other" field doesn't change the dropdown and collapse it.
  const [courseSelection, setCourseSelection] = useState(storedIsOther ? 'Other' : store.course)
  const [otherCourse, setOtherCourse] = useState(storedIsOther ? store.course : '')

  const {
    register,
    handleSubmit,
    control,
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

  async function onSubmit(data: RegistrationStep1Data) {
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

  // If validation blocks the step, move focus to the first invalid control.
  // RHF focuses registered fields automatically; this covers the skills group,
  // which has no native form ref, as a fallback.
  function onInvalid() {
    requestAnimationFrame(() => {
      const firstInvalid = document.querySelector<HTMLElement>(
        'form [aria-invalid="true"], form [data-invalid="true"]'
      )
      firstInvalid?.focus()
      firstInvalid?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Full Name"
          placeholder="Juan dela Cruz"
          autoComplete="name"
          required
          error={errors.full_name?.message}
          {...register('full_name')}
        />

        <Input
          label="Student Number"
          placeholder="2026-12345-BN-0"
          autoComplete="off"
          inputMode="text"
          required
          error={errors.student_number?.message}
          {...register('student_number')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Course"
            options={COURSE_OPTIONS}
            placeholder="Select course"
            required
            error={errors.course?.message}
            value={courseSelection}
            onChange={(e) => {
              const val = e.target.value
              setCourseSelection(val)
              if (val === 'Other') {
                // Keep whatever's typed (or empty) as the course value
                setValue('course', otherCourse, { shouldValidate: !!otherCourse })
              } else {
                setOtherCourse('')
                setValue('course', val, { shouldValidate: true })
              }
            }}
          />

          <Controller
            name="year_level"
            control={control}
            render={({ field }) => (
              <Select
                label="Year Level"
                options={YEAR_OPTIONS}
                placeholder="Select year level"
                required
                error={errors.year_level?.message}
                value={field.value?.toString() ?? ''}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
              />
            )}
          />
        </div>

        {courseSelection === 'Other' && (
          <Input
            label="Specify your course"
            placeholder="e.g. BS Civil Engineering"
            autoComplete="off"
            required
            value={otherCourse}
            onChange={(e) => {
              const val = e.target.value
              setOtherCourse(val)
              setValue('course', val, { shouldValidate: true })
            }}
            error={!otherCourse ? 'Please specify your course' : undefined}
          />
        )}

        <Controller
          name="section"
          control={control}
          render={({ field }) => (
            <Select
              label="Section"
              options={SECTION_OPTIONS}
              placeholder="Select section"
              hint="Each course and year level has two sections."
              required
              error={errors.section?.message}
              {...field}
            />
          )}
        />

        <Input
          label="Personal Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="juan@gmail.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="PUP Webmail"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="juandelacruz@iskolarngbayan.pup.edu.ph"
          hint="Format: YourFullName@iskolarngbayan.pup.edu.ph"
          required
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
              required
              error={errors.gender?.message}
              {...field}
            />
          )}
        />

        {/* AWS Interests multi-select */}
        <div className="flex flex-col gap-1.5">
          <label id="skills-label" className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
            AWS Interests <span style={{ color: 'var(--danger, #f87171)' }} aria-hidden="true">*</span>
          </label>
          <Controller
            name="skills"
            control={control}
            render={({ field }) => (
              <div
                role="group"
                aria-labelledby="skills-label"
                aria-invalid={errors.skills ? true : undefined}
                aria-describedby={errors.skills ? 'skills-error' : undefined}
                tabIndex={errors.skills ? -1 : undefined}
                data-invalid={errors.skills ? 'true' : undefined}
                className="flex flex-wrap gap-2"
              >
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
                      className="px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{
                        background: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                        color: isSelected ? '#ffffff' : 'var(--text)',
                        fontWeight: isSelected ? 700 : 500,
                        boxShadow: isSelected ? '0 0 12px rgba(79,143,247,0.35)' : 'none',
                      }}
                    >
                      {interest}
                    </button>
                  )
                })}
              </div>
            )}
          />
          {errors.skills && (
            <p id="skills-error" role="alert" className="text-xs font-medium" style={{ color: 'var(--danger, #f87171)' }}>{errors.skills.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" loading={isSubmitting} className="w-full mt-2">
        Continue to Application Questions
      </Button>
    </form>
  )
}
