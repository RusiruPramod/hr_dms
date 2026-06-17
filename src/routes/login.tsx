import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import logo from '@/assets/logo.png'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Signed in')
      navigate('/records', { replace: true })
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const register = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      toast.success('Account created — signed in')
      navigate('/records', { replace: true })
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <img src={logo} alt="Logo" className="h-12 w-auto" />
          <h1 className="text-2xl font-semibold">HR Document Management</h1>
        </div>

        <form onSubmit={login} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={register}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating…' : 'Create Account'}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>Demo:</strong> Use any email/password to create a test account. Firebase handles authentication.
          </p>
        </div>
      </div>
    </div>
  )
}
