// frontend/src/store/registration.ts
import { create } from 'zustand'
import type { Gender } from '../types'

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error'

interface RegistrationState {
  // Navigation
  currentStep: 1 | 2 | 3
  isFlipping: boolean

  // Step 1 — Personal Info
  full_name: string
  student_number: string
  course: string
  year_level: number | null
  section: string
  email: string
  scholar_email: string
  gender: Gender | ''
  skills: string[]

  // Step 2 — Application Questions
  why_join: string
  expectations: string

  // Step 3 — Attachments
  cor_file: File | null
  proof_of_share_file: File | null

  // Source tracking — how they found us
  heard_from: string

  // Submission
  submissionStatus: SubmissionStatus
  serverError: string | null

  // Actions
  setField: <K extends keyof RegistrationState>(key: K, value: RegistrationState[K]) => void
  goToStep: (step: 1 | 2 | 3) => void
  setFlipping: (v: boolean) => void
  setSubmissionStatus: (s: SubmissionStatus) => void
  setServerError: (msg: string | null) => void
  reset: () => void
}

const initialState = {
  currentStep: 1 as const,
  isFlipping: false,
  full_name: '',
  student_number: '',
  course: '',
  year_level: null,
  section: '',
  email: '',
  scholar_email: '',
  gender: '' as Gender | '',
  skills: [] as string[],
  why_join: '',
  expectations: '',
  cor_file: null,
  proof_of_share_file: null,
  heard_from: initialHeardFrom(),
  submissionStatus: 'idle' as SubmissionStatus,
  serverError: null,
}

/** Reads UTM source from the URL to prefill "how did you hear about us". */
function initialHeardFrom(): string {
  if (typeof window === 'undefined') return ''
  const params = new URLSearchParams(window.location.search)
  const utm = params.get('utm_source') || params.get('ref') || params.get('source')
  if (!utm) return ''
  const map: Record<string, string> = {
    facebook: 'Facebook',
    fb: 'Facebook',
    instagram: 'Instagram',
    ig: 'Instagram',
    linkedin: 'LinkedIn',
    classroom: 'Classroom / Professor',
    class: 'Classroom / Professor',
    partner: 'Partner Organization',
  }
  return map[utm.toLowerCase()] || ''
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  ...initialState,

  setField: (key, value) => set({ [key]: value } as Partial<RegistrationState>),

  goToStep: (step) => set({ currentStep: step }),

  setFlipping: (v) => set({ isFlipping: v }),

  setSubmissionStatus: (s) => set({ submissionStatus: s }),

  setServerError: (msg) => set({ serverError: msg }),

  reset: () => set(initialState),
}))
