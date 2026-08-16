// frontend/src/pages/AdminLoginPage.tsx
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAdminStore } from '../store/admin'
import { supabase } from '../lib/supabase'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAdminStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    setIsLoading(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError('Invalid credentials. Please try again.')
      setIsLoading(false)
      return
    }

    setAuth(data.user.id, data.session.access_token)
    navigate('/admin/dashboard', { replace: true })
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/sbg-logo.svg" alt="SBG Logo" className="h-12 w-12" />
          <div className="text-center">
            <h1 className="font-bold text-white text-xl">SBG Admin</h1>
            <p className="text-sbg-text-muted text-xs">Student Builder Group</p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-mono text-white text-lg font-bold">Sign In</h2>
              <p className="text-sbg-text-muted text-sm">Enter your admin secret to continue.</p>
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error ?? undefined}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              loading={isLoading}
              icon={<Lock className="w-4 h-4" />}
              className="w-full"
            >
              Sign In
            </Button>
          </form>
        </Card>

        <p className="text-center text-sbg-text-muted text-xs font-mono mt-6">
          SBG Portal Admin Panel
        </p>
      </div>
    </div>
  )
}
