'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface CourseActivationModalContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const CourseActivationModalContext = createContext<CourseActivationModalContextType | undefined>(undefined)

export function CourseActivationModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  return (
    <CourseActivationModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </CourseActivationModalContext.Provider>
  )
}

export function useCourseActivationModal() {
  const context = useContext(CourseActivationModalContext)
  if (context === undefined) {
    throw new Error('useCourseActivationModal must be used within a CourseActivationModalProvider')
  }
  return context
}
