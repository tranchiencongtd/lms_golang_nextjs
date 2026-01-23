'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  const router = useRouter()

  // Handle go back with fallback to home if no history or external referrer
  const handleGoBack = () => {
    // Check if there's a referrer and if it's from our website
    if (typeof window !== 'undefined') {
      const referrer = document.referrer
      const currentHost = window.location.host

      // If referrer exists and is from our website, go back
      if (referrer && referrer.includes(currentHost)) {
        router.back()
      } else {
        // Otherwise, go to home page
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">


      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full">
          <div className="max-w-3xl mx-auto text-center px-6 py-14">
            <div className="text-7xl sm:text-8xl font-black text-primary-600 mb-6">404</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">Không tìm thấy trang</h1>
            <p className="text-secondary-600 text-base sm:text-lg mb-8">
              Đường dẫn không đúng hoặc trang đã được di chuyển.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-secondary-800 font-semibold hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Quay lại
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
              >
                <Home className="w-5 h-5" />
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>


    </main>
  )
}

