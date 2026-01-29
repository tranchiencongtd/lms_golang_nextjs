import Link from 'next/link'
import {
  Facebook,
  Youtube,
  Phone,
  Mail
} from 'lucide-react'

const footerLinks = {
  courses: [
    { label: 'Toán Tiểu học (Lớp 1-5)', href: '/khoa-hoc?grade=1,2,3,4,5' },
    { label: 'Toán THCS (Lớp 6-9)', href: '/khoa-hoc?grade=6,7,8,9' },
    { label: 'Toán THPT (Lớp 10-12)', href: '/khoa-hoc?grade=10,11,12' },
    { label: 'Luyện thi THPT Quốc Gia', href: '/khoa-hoc?grade=12' },
  ],
  support: [
    { label: 'Hướng dẫn học tập', href: '/huong-dan-hoc' },
    // { label: 'Câu hỏi thường gặp', href: '/faq' },
    { label: 'Liên hệ hỗ trợ', href: '/lien-he' },
    // { label: 'Phản hồi ý kiến', href: '/phan-hoi' },
    { label: 'Điều khoản sử dụng', href: '/dieu-khoan' },
    { label: 'Chính sách bảo mật', href: '/chinh-sach' },
  ],
  about: [
    { label: 'Về TCmath', href: '/ve-chung-toi' },
    { label: 'Đội ngũ giáo viên', href: '/giao-vien' },
  ],
}

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/thaytranchien', label: 'Facebook' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
]

export default function Footer() {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Courses Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Khóa học</h4>
            <ul className="space-y-2">
              {footerLinks.courses.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Về chúng tôi</h4>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-secondary-400">
                <Phone className="w-4 h-4" />
                <span>0978959065</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-secondary-400">
                <Mail className="w-4 h-4" />
                <span>tranchiencva@gmail.com</span>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-sm text-secondary-400 mb-2">Theo dõi chúng tôi:</p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center text-secondary-400 hover:text-white transition-colors cursor-pointer"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-secondary-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo & Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 cursor-pointer">
                <img
                  src="https://raw.githubusercontent.com/tranchiencongtd/hosting-file/refs/heads/main/images/logo_thaytranchienedu.png"
                  alt="Thầy Trần Chiến"
                  className="h-10 w-auto object-contain"
                />
              </Link>
              {/* <p className="text-sm text-secondary-400">
                © 2026 Thầy Trần Chiến. 
              </p> */}
              <p className="text-sm text-secondary-400">
                Made by <Link href="https://www.facebook.com/toanthaycong" target="_blank" className="hover:underline">congtcdev</Link> with luv
              </p>
              <br />
            </div>

            {/* Certification */}
            <div className="text-sm text-secondary-400 text-center md:text-right">
              <p>Nền tảng học toán trực tuyến hàng đầu Việt Nam</p>
              {/* <p className="mt-1">Giấy phép hoạt động số: xxx/GP-BGDĐT</p> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
