'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, ChevronDown } from 'lucide-react'
import { useAuthModal } from '@/contexts/AuthModalContext'

const exploreCategories = [
  'Đại số',
  'Hình học',
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showExplore, setShowExplore] = useState(false)
  const { openLogin, openRegister } = useAuthModal()

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-secondary-200 shadow-nav">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Explore */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">∑</span>
              </div>
              <span className="text-xl font-heading font-bold text-primary-600">MathVN</span>
            </Link>

            {/* Explore Dropdown */}
            <div className="relative hidden lg:block">
              <button
                onMouseEnter={() => setShowExplore(true)}
                onMouseLeave={() => setShowExplore(false)}
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
                  <Link href="/khoa-hoc?grade=6,7,8,9" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 cursor-pointer">
                    Toán THCS (Lớp 6 - 9)
                  </Link>
                  <Link href="/khoa-hoc?grade=10,11,12" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 cursor-pointer">
                    Toán THPT (Lớp 10 - 12)
                  </Link>
                  <Link href="/khoa-hoc?grade=thpt" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 cursor-pointer">
                    Luyện thi THPT Quốc Gia
                  </Link>
                  <div className="px-4 py-2 border-b border-t border-secondary-100 mt-2">
                    <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">Chủ đề</p>
                  </div>
                  {exploreCategories.slice(0, 4).map((cat) => (
                    <Link key={cat} href={`/chu-de/${cat.toLowerCase().replace(' ', '-')}`} className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 cursor-pointer">
                      {cat}
                    </Link>
                  ))}
                  <Link href="/khoa-hoc" className="block px-4 py-2 text-sm text-primary-500 font-medium hover:bg-secondary-50 cursor-pointer">
                    Xem tất cả khoá học →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học, bài giảng..."
                className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 text-sm text-secondary-700 placeholder-secondary-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Right: Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Chức năng dành cho Giáo viên và Phụ huynh tạm ẩn
            <Link href="/giao-vien" className="btn-ghost">
              Dành cho Giáo viên
            </Link>
            <Link href="/phu-huynh" className="btn-ghost">
              Dành cho Phụ huynh
            </Link> */}
             <Link href="/huong-dan-hoc" className="btn-ghost">
              Hướng dẫn học
            </Link>
            <Link href="/thanh-toan" className="btn-ghost">
              Thanh toán
            </Link>
            <div className="w-px h-6 bg-secondary-200 mx-2" />
            <button onClick={openLogin} className="btn-ghost font-semibold text-primary-500 hover:text-primary-600">
              Đăng nhập
            </button>
            <button onClick={openRegister} className="btn-primary py-2 px-4">
              Đăng ký
            </button>
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
                placeholder="Tìm kiếm khóa học..."
                className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Link href="/kham-pha" className="block px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 cursor-pointer">
                Khám phá
              </Link>
              <Link href="/toan-thcs" className="block px-3 py-2 text-sm text-secondary-600 hover:bg-secondary-50 cursor-pointer">
                Toán THCS
              </Link>
              <Link href="/toan-thpt" className="block px-3 py-2 text-sm text-secondary-600 hover:bg-secondary-50 cursor-pointer">
                Toán THPT
              </Link>
              <Link href="/luyen-thi-thpt" className="block px-3 py-2 text-sm text-secondary-600 hover:bg-secondary-50 cursor-pointer">
                Luyện thi THPT QG
              </Link>
            </div>
            
            <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-secondary-200">
              <button onClick={() => { openLogin(); setIsOpen(false); }} className="btn-secondary text-center">
                Đăng nhập
              </button>
              <button onClick={() => { openRegister(); setIsOpen(false); }} className="btn-primary text-center">
                Đăng ký
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
