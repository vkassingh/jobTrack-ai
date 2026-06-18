import { create } from 'zustand'

interface AuthState {
  token: string | null
  userEmail: string | null
  login: (token: string, email: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  userEmail: localStorage.getItem('userEmail'),
  login: (token, email) => {
    localStorage.setItem('token', token)
    localStorage.setItem('userEmail', email)
    set({ token, userEmail: email })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    set({ token: null, userEmail: null })
  },
}))
