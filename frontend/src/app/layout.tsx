import type { Metadata } from 'next'
import { Poppins, Open_Sans } from 'next/font/google'
import './globals.css'
import { AuthModalProvider } from '@/contexts/AuthModalContext'
import { AuthProvider } from '@/contexts/AuthContext'
import AuthModal from '@/components/AuthModal'

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'MathVN - Học Toán Online Hiệu Quả',
  description: 'Nền tảng học toán trực tuyến hàng đầu Việt Nam. Khóa học từ lớp 6-12, luyện thi THPT Quốc Gia, và toán cao cấp với giáo viên giỏi.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${poppins.variable} ${openSans.variable}`}>
      <body className="font-body antialiased bg-white text-secondary-800">
        <AuthProvider>
          <AuthModalProvider>
            {children}
            <AuthModal />
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
