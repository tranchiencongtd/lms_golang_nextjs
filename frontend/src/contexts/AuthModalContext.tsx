'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type AuthView = 'login' | 'register' | 'forgot-password' | null

interface AuthModalContextType {
  isOpen: boolean
  view: AuthView
  openLogin: () => void
  openRegister: () => void
  openForgotPassword: () => void
  closeModal: () => void
  switchView: (view: AuthView) => void
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<AuthView>(null)

  const openLogin = () => {
    setView('login')
    setIsOpen(true)
  }

  const openRegister = () => {
    setView('register')
    setIsOpen(true)
  }

  const openForgotPassword = () => {
    setView('forgot-password')
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setTimeout(() => setView(null), 300)
  }

  const switchView = (newView: AuthView) => {
    setView(newView)
  }

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        view,
        openLogin,
        openRegister,
        openForgotPassword,
        closeModal,
        switchView,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider')
  }
  return context
}
