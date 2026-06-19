import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/auth'

interface MessageState {
  type: 'success' | 'error'
  text: string
}

export default function Profile() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<MessageState | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<MessageState | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const fetchProfile = async () => {
      setLoading(true)
      try {
        const response = await api.get('/auth/profile')
        setEmail(response.data.email)
        setFullName(response.data.fullName || '')
      } catch (error) {
        setProfileMessage({ type: 'error', text: 'Unable to load profile. Please try again.' })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [token, navigate])

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileMessage(null)
    setLoading(true)

    try {
      await api.put('/auth/profile', { fullName })
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' })
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error?.response?.data?.message || 'Unable to update profile.' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordMessage(null)
    setPasswordLoading(true)

    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      setPasswordMessage({ type: 'success', text: 'Password changed successfully.' })
      setCurrentPassword('')
      setNewPassword('')
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error?.response?.data?.message || 'Unable to change password.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="bg-surface min-h-screen text-on-surface">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Profile Management</h1>
            <p className="mt-2 text-base text-on-surface-variant max-w-2xl">
              Update your display name and manage your password in one place.
            </p>
          </div>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-sm transition hover:opacity-90"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-outline-variant bg-surface-container-high p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-on-surface">Update Profile</h2>
                <p className="mt-1 text-sm text-on-surface-variant">Change your full name and keep your profile current.</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleProfileSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-on-surface">Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface disabled:cursor-not-allowed disabled:bg-surface-container-lowest"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-on-surface">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {profileMessage && (
                <div className={`rounded-2xl px-4 py-3 text-sm ${profileMessage.type === 'success' ? 'bg-primary-container text-primary' : 'bg-error-container text-error'}`}>
                  {profileMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-outline-variant bg-surface-container-high p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-on-surface">Change Password</h2>
              <p className="mt-1 text-sm text-on-surface-variant">Update your password for better account security.</p>
            </div>

            <form className="space-y-5" onSubmit={handlePasswordSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-on-surface">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Current password"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-on-surface">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="New password"
                />
              </div>

              {passwordMessage && (
                <div className={`rounded-2xl px-4 py-3 text-sm ${passwordMessage.type === 'success' ? 'bg-primary-container text-primary' : 'bg-error-container text-error'}`}>
                  {passwordMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordLoading ? 'Updating…' : 'Change Password'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
