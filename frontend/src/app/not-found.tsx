'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full">
          <div className="max-w-3xl mx-auto text-center px-6 py-14">
            <div className="text-7xl sm:text-8xl font-black text-primary-600 mb-6">404</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-8">Không tìm thấy trang</h1>
            {/* <p className="text-secondary-600 text-base sm:text-lg mb-8">
              Đường dẫn không đúng hoặc trang đã được di chuyển. Bạn có thể quay về trang chủ hoặc xem danh sách khóa học để tiếp tục.
            </p> */}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
              >
                Về trang chủ
              </Link>
              <Link
                href="/khoa-hoc"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-200 text-secondary-800 font-semibold hover:bg-gray-50 transition-colors"
              >
                Xem khóa học
              </Link>
            </div>
          </div>
        </div>
      </div>

      
    </main>
  )
}
