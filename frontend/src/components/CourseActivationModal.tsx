'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Key, CheckCircle, AlertCircle } from 'lucide-react'
import { useCourseActivationModal } from '@/contexts/CourseActivationModalContext'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModal } from '@/contexts/AuthModalContext'

export default function CourseActivationModal() {
  const { isOpen, closeModal } = useCourseActivationModal()
  const { isAuthenticated } = useAuth()
  const { openLogin } = useAuthModal()
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Focus trap: focus vào modal khi mở
      modalRef.current?.focus()
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, closeModal])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-activation-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Đóng modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isAuthenticated ? (
          <ActivateCourseForm onClose={closeModal} />
        ) : (
          <LoginRequiredView onClose={closeModal} onLogin={openLogin} />
        )}
      </div>
    </div>
  )
}

function LoginRequiredView({
  onClose,
  onLogin
}: {
  onClose: () => void
  onLogin: () => void
}) {
  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-secondary-400" />
      </div>
      <h2
        id="course-activation-title"
        className="text-2xl font-heading font-bold text-secondary-900 mb-2"
      >
        Vui lòng đăng nhập
      </h2>
      <p className="text-secondary-600 mb-6">
        Bạn cần đăng nhập để kích hoạt khoá học
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => {
            // Tránh 2 modal chồng nhau: đóng modal kích hoạt trước rồi mở modal đăng nhập
            onClose()
            onLogin()
          }}
          className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
        >
          Đăng nhập ngay
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 border border-gray-200 text-secondary-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  )
}

function ActivateCourseForm({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activatedCourseName, setActivatedCourseName] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { activateCourse } = await import('@/lib/api/enrollments')
      const result = await activateCourse(code.trim())

      setIsLoading(false)
      setSuccess(true)
      setActivatedCourseName(result.course?.title || 'Khoá học')
      setCode('')
    } catch (err: any) {
      setIsLoading(false)
      // Handle API error messages
      const errorMessage = err.response?.data?.message || err.message || 'Kích hoạt thất bại. Vui lòng thử lại.'
      setError(errorMessage)
    }
  }

  const handleReset = () => {
    setSuccess(false)
    setCode('')
    setError(null)
    setActivatedCourseName('')
  }

  if (success) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-secondary-900 mb-2">
          Kích hoạt thành công!
        </h2>
        <p className="text-secondary-600 mb-6">
          Khoá học <strong className="text-secondary-900">{activatedCourseName}</strong> đã được kích hoạt và thêm vào tài khoản của bạn.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleReset}
            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Kích hoạt khoá học khác
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 border border-gray-200 text-secondary-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-primary-600" />
        </div>
        <h2
          id="course-activation-title"
          className="text-2xl font-heading font-bold text-secondary-900 mb-2"
        >
          Kích hoạt khoá học
        </h2>
        <p className="text-secondary-600 text-sm">
          Nhập mã kích hoạt để thêm khoá học vào tài khoản của bạn
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {error && (
          <div
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Code input */}
        <div>
          <label htmlFor="activation-code" className="block text-sm font-medium text-secondary-700 mb-2">
            Mã kích hoạt <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="activation-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError(null)
            }}
            required
            placeholder="Mã kích hoạt có định dạng: XXXX-XXXX-XXXX"
            className="w-full px-4 py-3 border border-secondary-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            autoFocus
            disabled={isLoading}
          />
          {/* <p className="mt-2 text-xs text-secondary-500">
            Mã kích hoạt có định dạng: XXXX-XXXX-XXXX
          </p> */}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !code.trim()}
          className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <Key className="w-5 h-5" />
              <span>Kích hoạt khoá học</span>
            </>
          )}
        </button>
      </form>

      {/* Help section */}
      <div className="mt-6 pt-6 border-t border-secondary-200">
        <h3 className="text-sm font-semibold text-secondary-900 mb-2">
          Cần hỗ trợ?
        </h3>
        <ul className="space-y-1.5 text-sm text-secondary-600">
          <li>• Mã kích hoạt được cung cấp khi bạn mua khoá học</li>
          <li>• Mã kích hoạt có thể được sử dụng một lần</li>
          <li>• Nếu gặp vấn đề, vui lòng liên hệ: <a href="tel:0973507865" className="text-primary-600 hover:underline">0973.507.865</a></li>
        </ul>
      </div>
    </div>
  )
}
