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
    navigate(`/${__ADMIN_PATH__}/dashboard`, { replace: true })
    setIsLoading(false)
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-grid" aria-hidden="true" />
      <div className="admin-login-wrap">
        <div className="admin-login-brand">
          <div className="admin-login-mark"><img src="/sbg-logo-white.svg" alt="" /></div>
          <div><p>STUDENT BUILDER GROUP</p><h1>Admin workspace</h1><span>PUP Biñan · secure access</span></div>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 admin-login-card">
            <div className="flex flex-col gap-1">
              <div className="admin-login-kicker"><span /> SIGN IN</div>
              <h2 className="font-sans text-white text-2xl font-bold">Welcome back.</h2>
              <p className="text-sbg-text-muted text-sm">Use your admin credentials to manage the chapter portal.</p>
            </div>
            <Input label="Email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Input label="Password" type="password" placeholder="Enter password..." value={password} onChange={(e) => setPassword(e.target.value)} error={error ?? undefined} autoComplete="current-password" />
            <Button type="submit" loading={isLoading} icon={<Lock className="w-4 h-4" />} className="w-full admin-login-submit">Sign In</Button>
          </form>
        </Card>
        <p className="admin-login-foot">SBG PORTAL ADMIN PANEL <span>·</span> ACCESS LOGGED</p>
      </div>
    </div>
  )
}
