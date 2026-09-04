import { BackButton } from '../components/ui/BackButton'

export default function SubmitCorPage() {
  return (
    <div className="min-h-screen bg-sbg-black flex flex-col">
      <div className="px-5 py-4">
        <BackButton to="/" label="Back to Registration" />
      </div>

      <div className="flex-1 flex items-center justify-center px-5 pb-16">
        <div className="w-full max-w-md text-center">
          <h1 className="text-xl font-bold text-sbg-text">Submit your COR</h1>
          <p className="text-sm text-sbg-muted mt-2">
            This feature is coming soon. For now, please email your COR to{' '}
            <a href="mailto:sbg.pupbinan@gmail.com" style={{ color: '#2d9cdb' }}>sbg.pupbinan@gmail.com</a>{' '}
            with your student number in the subject line.
          </p>
        </div>
      </div>
    </div>
  )
}
