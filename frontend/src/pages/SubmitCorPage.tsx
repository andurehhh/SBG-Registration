import { useState, type FormEvent } from 'react'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { FileUpload } from '../components/ui/FileUpload'
import { edgeFn, ApiError } from '../lib/api'
import { BackButton } from '../components/ui/BackButton'

type PageState = 'input' | 'upload' | 'success' | 'error'

export default function SubmitCorPage() {
  const [state, setState] = useState<PageState>('input')
  const [studentNumber, setStudentNumber] = useState('')
  const [corFile, setCorFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [memberName, setMemberName] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!studentNumber.trim() || !corFile) return

    setLoading(true)
    setErrorMsg('')

    try {
      const formData = new FormData()
      formData.append('student_number', studentNumber.trim())
      formData.append('cor_file', corFile)

      const result = await edgeFn.postForm<{ name: string }>('submit-cor', formData)
      if (result.success) {
        setMemberName(result.data.name)
        setState('success')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sbg-black flex flex-col">
      <div className="px-5 py-4">
        <BackButton to="/" label="Back to Home" />
      </div>

      <div className="flex-1 flex items-center justify-center px-5 pb-16">
        <div className="w-full max-w-md">

          {state === 'success' ? (
            <div className="flex flex-col items-center text-center gap-4">
              <CheckCircle className="w-12 h-12 text-sbg-accent" />
              <h1 className="text-xl font-bold text-sbg-text">COR Submitted!</h1>
              <p className="text-sm text-sbg-muted">
                Thanks, <span className="font-medium text-sbg-text">{memberName}</span>. Your Certificate of Registration has been uploaded. Our team will review your application shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-sbg-text">Submit your COR</h1>
                <p className="text-sm text-sbg-muted mt-1">
                  Enter your student number and upload your Certificate of Registration.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Student Number"
                  placeholder="2026-12345-BN-0"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                />

                <FileUpload
                  label="Certificate of Registration (COR)"
                  value={corFile}
                  onChange={(file) => setCorFile(file)}
                  hint="JPEG, PNG, or PDF. Max 1MB."
                />

                {errorMsg && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-900/20 border border-red-700/50">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">{errorMsg}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  disabled={!studentNumber.trim() || !corFile}
                  icon={<Upload className="w-4 h-4" />}
                  className="w-full mt-2"
                >
                  Submit COR
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
