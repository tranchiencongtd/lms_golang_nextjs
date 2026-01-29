import type { Metadata } from 'next'
import { Montserrat, Open_Sans } from 'next/font/google'
import './globals.css'
import { AuthModalProvider } from '@/contexts/AuthModalContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { CourseActivationModalProvider } from '@/contexts/CourseActivationModalContext'
import AuthModal from '@/components/AuthModal'
import CourseActivationModal from '@/components/CourseActivationModal'
import ProgressProviderWrapper from '@/components/ProgressProviderWrapper'

const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
})

const openSans = Open_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://thaytranchienedu.vn'),
  title: {
    default: 'TCmath- Học Toán Online Hiệu Quả',
    template: '%s | TCmath'
  },
  description: 'Nền tảng học toán trực tuyến hàng đầu Việt Nam. Khóa học từ lớp 6-12, luyện thi THPT Quốc Gia, và toán cao cấp với giáo viên giỏi.',
  keywords: ['học toán online', 'luyện thi toán', 'toán thpt quốc gia', 'thầy trần chiến', 'học toán trực tuyến'],
  authors: [{ name: 'TCmathTeam' }],
  creator: 'TCmath',
  publisher: 'TCmath',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    title: 'TCmath- Học Toán Online Hiệu Quả',
    description: 'Nền tảng học toán trực tuyến hàng đầu Việt Nam. Khóa học từ lớp 6-12, luyện thi THPT Quốc Gia.',
    siteName: 'TCmath',
    images: [
      {
        url: 'https://raw.githubusercontent.com/tranchiencongtd/hosting-file/refs/heads/main/images/seo_cover.png', // You should create this image in public/
        width: 1200,
        height: 630,
        alt: 'TCmath- Học Toán Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TCmath- Học Toán Online Hiệu Quả',
    description: 'Nền tảng học toán trực tuyến hàng đầu Việt Nam. Khóa học từ lớp 6-12, luyện thi THPT Quốc Gia.',
    images: ['https://raw.githubusercontent.com/tranchiencongtd/hosting-file/refs/heads/main/images/seo_cover.png'], // Reuse OG image
  },
  icons: {
    icon: 'https://raw.githubusercontent.com/tranchiencongtd/hosting-file/refs/heads/main/images/icon.ico',
    apple: 'https://raw.githubusercontent.com/tranchiencongtd/lms/3b769efd407937d27b911283104c4173f0666752/public/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${montserrat.variable} ${openSans.variable}`}>
      <body className="font-body antialiased bg-white text-secondary-800" suppressHydrationWarning>
        <ProgressProviderWrapper>
          <AuthProvider>
            <AuthModalProvider>
              <CourseActivationModalProvider>
                {children}
                <AuthModal />
                <CourseActivationModal />
              </CourseActivationModalProvider>
            </AuthModalProvider>
          </AuthProvider>
        </ProgressProviderWrapper>
      </body>
    </html>
  )
}
