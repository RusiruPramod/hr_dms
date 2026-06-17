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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-sm p-4 sm:p-6 md:p-8 bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl">
        <div className="flex flex-col items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <img src={logo} alt="Logo" className="h-16 sm:h-20 md:h-24 w-auto" />
          <h1 className="text-xl sm:text-2xl font-semibold text-center">HR Document Management</h1>
        </div>

        <form onSubmit={login} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="text-sm"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="text-sm"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
            <Button type="submit" disabled={loading} className="w-full sm:flex-1 text-sm sm:text-base">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={register}
              disabled={loading}
              className="w-full sm:flex-1 text-sm sm:text-base"
            >
              {loading ? 'Creating…' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
