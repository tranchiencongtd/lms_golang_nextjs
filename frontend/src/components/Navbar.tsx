'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Search, ChevronDown, User, BookOpen, Settings, LogOut, Key, ChevronUp, Lock } from 'lucide-react'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCourseActivationModal } from '@/contexts/CourseActivationModalContext'


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showExplore, setShowExplore] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { openLogin, openRegister } = useAuthModal()
  const { user, isAuthenticated, logout } = useAuth()
  const { openModal: openCourseActivationModal } = useCourseActivationModal()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const exploreRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close User Menu
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      // Close Explore Menu
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setShowExplore(false)
      }
    }

    if (showUserMenu || showExplore) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu, showExplore])

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
  }

  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/khoa-hoc?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsOpen(false) // Close mobile menu if open
      setSearchQuery('') // Clear input after search
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e as unknown as React.FormEvent)
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-secondary-200 shadow-nav">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo  + Explore */}
          <div className="flex items-center gap-1">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <img
                src="https://raw.githubusercontent.com/tranchiencongtd/hosting-file/refs/heads/main/images/logo_thaytranchienedu.png"
                alt="Thầy Trần Chiến"
                className="h-14 w-auto object-contain"
              />
            </Link>


            {/* Explore Dropdown */}
            <div className="relative hidden md:block" ref={exploreRef}>
              <button
                onMouseEnter={() => setShowExplore(true)}
                onMouseLeave={() => setShowExplore(false)}
                onClick={() => setShowExplore(!showExplore)}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-100 rounded transition-colors cursor-pointer"
              >
                Khám phá
                <ChevronDown className="w-4 h-4" />
              </button>

              {showExplore && (
                <div
                  onMouseEnter={() => setShowExplore(true)}
                  onMouseLeave={() => setShowExplore(false)}
                  className="absolute top-full left-0 w-64 bg-white border border-secondary-200 shadow-lg py-2"
                >
                  <div className="px-4 py-2 border-b border-secondary-100">
                    <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">Cấp học</p>
                  </div>
                  <Link href="/khoa-hoc?grade=1,2,3,4,5" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 cursor-pointer">
                    Toán Tiểu học (Lớp 1 - 5)
                  </Link>
                  <Link href="/khoa-hoc?grade=6,7,8,9" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 cursor-pointer">
                    Toán THCS (Lớp 6 - 9)
                  </Link>
                  <Link href="/khoa-hoc?grade=10,11,12" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 cursor-pointer">
                    Toán THPT (Lớp 10 - 12)
                  </Link>
                  <Link href="/khoa-hoc?grade=12" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 cursor-pointer">
                    Luyện thi THPT Quốc Gia
                  </Link>

                  <Link href="/khoa-hoc" className="block px-4 py-2 text-sm text-primary-500 font-medium hover:bg-secondary-50 cursor-pointer">
                    Xem tất cả khoá học →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm kiếm khóa học"
                className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 text-sm text-secondary-700 placeholder-secondary-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Kích hoạt khoá học Button */}
          {(
            <button
              onClick={openCourseActivationModal}
              className="mr-4 hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg"
            >
              <Key className="w-4 h-4" />
              Kích hoạt khoá học
            </button>
          )}

          {/* Right: Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center gap-2 ">
            {isAuthenticated && user ? (
              <>
                <Link href="/huong-dan-hoc" className="btn-ghost hidden xl:block">
                  Hướng dẫn học
                </Link>
                <Link href="/thanh-toan" className="btn-ghost hidden xl:block">
                  Thanh toán
                </Link>
                <div className="w-px h-6 bg-secondary-200 mx-2" />

                {/* User Avatar & Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary-50 transition-colors"
                  >
                    <div className="relative">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.full_name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-primary-100"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-primary-100">
                          {getUserInitials(user.full_name)}
                        </div>
                      )}
                      {/* Online indicator */}
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="text-sm font-medium text-secondary-700 max-w-[120px] truncate">
                      {user.full_name}
                    </span>
                    {showUserMenu ? (
                      <ChevronUp className="w-4 h-4 text-secondary-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-secondary-500" />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-secondary-200 rounded-xl shadow-lg py-2 z-50 animate-[fadeIn_0.2s_ease-out]">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-secondary-100">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                              {getUserInitials(user.full_name)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-secondary-900 truncate">
                              {user.full_name}
                            </p>
                            <p className="text-xs text-secondary-500 truncate">
                              {user.email}
                            </p>
                            {user.role !== 'student' && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                                {user.role === 'teacher' ? 'Giáo viên' : 'Quản trị viên'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            openCourseActivationModal()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors text-left"
                        >
                          <Key className="w-4 h-4 text-secondary-500" />
                          <span>Kích hoạt khoá học</span>
                        </button>
                        <Link
                          href="/tai-khoan?tab=profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-secondary-500" />
                          <span>Thông tin tài khoản</span>
                        </Link>
                        <Link
                          href="/tai-khoan?tab=courses"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-secondary-500" />
                          <span>Khoá học của tôi</span>
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            openCourseActivationModal()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors text-left md:hidden"
                        >
                          <Key className="w-4 h-4 text-secondary-500" />
                          <span>Kích hoạt khoá học</span>
                        </button>
                        {/* <Link
                          href="/cai-dat"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-secondary-500" />
                          <span>Cài đặt</span>
                        </Link> */}
                        <Link
                          href="/tai-khoan?tab=password"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        >
                          <Lock className="w-4 h-4 text-secondary-500" />
                          <span>Đổi mật khẩu</span>
                        </Link>
                        <div className="my-1 border-t border-secondary-100"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Chức năng dành cho Giáo viên và Phụ huynh tạm ẩn
                <Link href="/giao-vien" className="btn-ghost">
                  Dành cho Giáo viên
                </Link>
                <Link href="/phu-huynh" className="btn-ghost">
                  Dành cho Phụ huynh
                </Link> */}

                <Link href="/huong-dan-hoc" className="btn-ghost hidden xl:block">
                  Hướng dẫn học
                </Link>
                <Link href="/thanh-toan" className="btn-ghost hidden xl:block">
                  Thanh toán
                </Link>
                <div className="w-px h-6 bg-secondary-200 mx-2 hidden xl:block" />
                <button onClick={openLogin} className="btn-ghost font-semibold text-primary-500 hover:text-primary-600">
                  Đăng nhập
                </button>
                <button onClick={openRegister} className="btn-primary py-2 px-4">
                  Đăng ký
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-secondary-600 hover:bg-secondary-100 transition-colors cursor-pointer"
            aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm kiếm khóa học"
                className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Link href="/khoa-hoc?grade=1,2,3,4,5" className="block px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 cursor-pointer">
                Toán Tiểu học (Lớp 1 - 5)
              </Link>
              <Link href="/khoa-hoc?grade=6,7,8,9" className="block px-3 py-2 text-sm text-secondary-600 hover:bg-secondary-50 cursor-pointer">
                Toán THCS (Lớp 6 - 9)
              </Link>
              <Link href="/khoa-hoc?grade=10,11,12" className="block px-3 py-2 text-sm text-secondary-600 hover:bg-secondary-50 cursor-pointer">
                Toán THPT (Lớp 10 - 12)
              </Link>
            </div>

            {/* Mobile Auth Section */}
            {isAuthenticated && user ? (
              <div className="pt-4 mt-4 border-t border-secondary-200">
                {/* Mobile User Info */}
                <div className="flex items-center gap-3 px-3 py-3 bg-secondary-50 rounded-lg mb-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                      {getUserInitials(user.full_name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-secondary-900 truncate">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-secondary-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Mobile Menu Links */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      openCourseActivationModal()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg text-left"
                  >
                    <Key className="w-4 h-4" />
                    Kích hoạt khoá học
                  </button>
                  <Link
                    href="/tai-khoan?tab=courses"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 rounded-lg"
                  >
                    <BookOpen className="w-4 h-4" />
                    Khoá học của tôi
                  </Link>
                  <Link
                    href="/tai-khoan?tab=profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 rounded-lg"
                  >
                    <User className="w-4 h-4" />
                    Thông tin tài khoản
                  </Link>
                  {/* <Link
                    href="/cai-dat"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 rounded-lg"
                  >
                    <Settings className="w-4 h-4" />
                    Cài đặt
                  </Link> */}
                  <Link
                    href="/tai-khoan?tab=password"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 rounded-lg"
                  >
                    <Lock className="w-4 h-4" />
                    Đổi mật khẩu
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-secondary-200">
                <button onClick={() => { openLogin(); setIsOpen(false); }} className="btn-secondary text-center">
                  Đăng nhập
                </button>
                <button onClick={() => { openRegister(); setIsOpen(false); }} className="btn-primary text-center">
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
