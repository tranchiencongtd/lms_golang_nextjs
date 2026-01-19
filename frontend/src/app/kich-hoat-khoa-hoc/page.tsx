'use client'

import { useState } from 'react'
import { Key, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ActivateCoursePage() {
  const { isAuthenticated } = useAuth()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // TODO: Implement API call to activate course
    setTimeout(() => {
      setIsLoading(false)
      setSuccess(true)
      setCode('')
    }, 1500)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-secondary-900 mb-2">
            Vui lòng đăng nhập
          </h2>
          <p className="text-secondary-600">
            Bạn cần đăng nhập để kích hoạt khoá học
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-secondary-900 mb-2">
            Kích hoạt thành công!
          </h2>
          <p className="text-secondary-600 mb-6">
            Khoá học đã được kích hoạt và thêm vào tài khoản của bạn.
          </p>
          <button
            onClick={() => {
              setSuccess(false)
              setCode('')
            }}
            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Kích hoạt khoá học khác
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
              Kích hoạt khoá học
            </h1>
            <p className="text-secondary-600">
              Nhập mã kích hoạt để thêm khoá học vào tài khoản của bạn
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Code input */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-secondary-700 mb-2">
                Mã kích hoạt <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError(null)
                }}
                required
                placeholder="Nhập mã kích hoạt (VD: ABC123-XYZ789)"
                className="w-full px-4 py-3 border border-secondary-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              <p className="mt-2 text-xs text-secondary-500">
                Mã kích hoạt thường có định dạng: XXXX-XXXX-XXXX hoặc XXXXXXXXXX
              </p>
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
          <div className="mt-8 pt-8 border-t border-secondary-200">
            <h3 className="text-sm font-semibold text-secondary-900 mb-3">
              Cần hỗ trợ?
            </h3>
            <ul className="space-y-2 text-sm text-secondary-600">
              <li>• Mã kích hoạt được cung cấp khi bạn mua khoá học</li>
              <li>• Mã kích hoạt có thể được sử dụng một lần</li>
              <li>• Nếu gặp vấn đề, vui lòng liên hệ: <a href="tel:0973507865" className="text-primary-600 hover:underline">0973.507.865</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
