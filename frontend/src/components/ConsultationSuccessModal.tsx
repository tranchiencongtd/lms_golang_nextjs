'use client'

import { useRef, useEffect } from 'react'
import { X, CheckCircle } from 'lucide-react'

interface ConsultationSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  studentName?: string
}

export default function ConsultationSuccessModal({ isOpen, onClose, studentName }: ConsultationSuccessModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      modalRef.current?.focus()
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Đóng modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đăng ký thành công!
          </h2>

          <p className="text-gray-600 mb-6">
            Cảm ơn {studentName ? `bạn ${studentName}` : 'bạn'} đã đăng ký tư vấn.
            Chúng tôi sẽ liên hệ trong vòng <span className="font-semibold text-gray-900">24 giờ</span> làm việc.
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#0056D2] text-white font-semibold rounded-xl hover:bg-[#004BB5] transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
