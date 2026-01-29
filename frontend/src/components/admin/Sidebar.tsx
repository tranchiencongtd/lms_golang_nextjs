'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, MessageSquare, LogOut, Key } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const menuItems = [
  { title: 'Tổng quan', icon: LayoutDashboard, href: '/admin/dashboard' },
  { title: 'Người dùng', icon: Users, href: '/admin/users' },
  { title: 'Khóa học', icon: BookOpen, href: '/admin/courses' },
  { title: 'Mã kích hoạt', icon: Key, href: '/admin/activation-codes' },
  { title: 'Tư vấn', icon: MessageSquare, href: '/admin/consultations' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src="https://raw.githubusercontent.com/tranchiencongtd/hosting-file/refs/heads/main/images/logo_thaytranchienedu.png"
            alt="Thầy Trần Chiến"
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-3 px-3">
          <p className="text-base font-medium text-gray-900 truncate">{user?.full_name}</p>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
