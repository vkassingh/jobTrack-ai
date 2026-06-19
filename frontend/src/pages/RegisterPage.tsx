import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, AlertCircle, BriefcaseBusiness } from 'lucide-react'
import api from '../lib/api'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      await api.post('/auth/register', { name, email, password })
      navigate('/login?registered=true')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-md py-lg relative overflow-hidden">
      {/* Background ornaments */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-secondary-container/10 rounded-full blur-[80px]" />
      </div>

      <main className="w-full max-w-[440px] flex flex-col gap-lg">
        {/* Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_12px_rgba(0,0,0,0.03)] px-xl py-xl flex flex-col gap-xl">

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center gap-sm">
            <div className="flex items-center gap-sm">
              <BriefcaseBusiness className="text-primary" size={28} />
              <span className="font-h2 text-h2 font-bold text-primary">JobTrack AI</span>
            </div>
            <div className="flex flex-col gap-xs mt-sm">
              <h1 className="font-h2 text-h2 text-on-surface">Create your account</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Start tracking your job applications with AI</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
            <div className="flex flex-col gap-sm">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="name">
                Full Name
              </label>
              <input
                className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                id="name"
                placeholder="Enter your name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-sm">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                id="email"
                placeholder="name@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-sm">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors pr-10"
                  id="password"
                  placeholder="Create a strong password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-sm px-md py-sm bg-error-container rounded-lg">
                <AlertCircle size={16} className="text-error shrink-0" />
                <p className="font-label-sm text-label-sm text-on-error-container">{error}</p>
              </div>
            )}

            <button
              className="w-full flex items-center justify-center gap-sm bg-primary hover:opacity-90 active:scale-[0.98] text-on-primary py-sm px-lg rounded-lg font-button text-button shadow-sm transition-all disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center font-body-md text-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link className="text-primary font-semibold hover:underline underline-offset-4" to="/login">
              Log in
            </Link>
          </p>
        </div>

        <footer className="flex flex-wrap justify-center gap-lg opacity-60 pb-sm">
          <a className="font-label-sm text-label-sm text-on-surface hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="font-label-sm text-label-sm text-on-surface hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="font-label-sm text-label-sm text-on-surface hover:text-primary transition-colors" href="#">Cookie Policy</a>
        </footer>
      </main>
    </div>
  )
}
