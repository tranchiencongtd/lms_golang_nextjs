'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ArrowRight, CheckCircle } from 'lucide-react'

const highlights = [
  'Học cùng đội ngũ giáo viên giỏi, giàu kinh nghiệm',
  'Bài tập thực hành phong phú với đáp án chi tiết',
  'Hỗ trợ học tập 24/7 qua nền tảng trực tuyến',
]

const gradeOptions = [
  { label: 'Lớp 1', value: '1' },
  { label: 'Lớp 2', value: '2' },
  { label: 'Lớp 3', value: '3' },
  { label: 'Lớp 4', value: '4' },
  { label: 'Lớp 5', value: '5' },
  { label: 'Lớp 6', value: '6' },
  { label: 'Lớp 7', value: '7' },
  { label: 'Lớp 8', value: '8' },
  { label: 'Lớp 9', value: '9' },
  { label: 'Lớp 10', value: '10' },
  { label: 'Lớp 11', value: '11' },
  { label: 'Lớp 12', value: '12' },
]

export default function Hero() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/khoa-hoc?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e as unknown as React.FormEvent)
    }
  }

  return (
    <section className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Heading */}
            <h1 className="text-lg sm:text-5xl lg:text-5xl font-heading font-bold leading-tight text-white">
              Học Toán Online
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-sm sm:text-lg text-primary-100 max-w-lg">
              Nền tảng học toán trực tuyến hàng đầu với hơn 500+ khóa học
              từ lớp 1-12, luyện thi THPT Quốc Gia.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a href="#dang-ky-tu-van" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors cursor-pointer">
                Đăng ký tư vấn
              </a>
              <Link href="/khoa-hoc" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white text-white font-semibold hover:bg-white/10 transition-colors cursor-pointer">
                Xem khóa học
              </Link>
            </div>

            {/* Highlights */}
            <div className="mt-10 space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-accent-green flex-shrink-0" />
                  <span className="text-sm text-primary-100">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Search Card */}
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <h2 className="text-3xl font-heading font-semibold text-secondary-900 mb-2">
              Bạn muốn học gì?
            </h2>
            <p className="text-base text-secondary-600 mb-6">
              Tìm khóa học phù hợp với trình độ và mục tiêu của bạn
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm khóa học"
                className="w-full pl-12 pr-24 py-4 bg-secondary-50 border border-secondary-200 text-secondary-700 placeholder-secondary-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded hover:bg-primary-600 transition-colors"
              >
                Tìm kiếm
              </button>
            </form>

            {/* Popular Searches - Grade Filter */}
            <div className="mb-6">
              <p className="text-sm text-secondary-500 mb-3">Lớp học:</p>
              <div className="flex flex-wrap gap-2">
                {gradeOptions.map((grade) => (
                  <Link
                    key={grade.value}
                    href={`/khoa-hoc?grade=${grade.value}`}
                    className="px-3 py-1.5 bg-secondary-100 text-secondary-700 text-sm hover:bg-primary-100 hover:text-primary-700 transition-colors cursor-pointer"
                  >
                    {grade.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Explore Button */}
            <Link
              href="/khoa-hoc"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors cursor-pointer"
            >
              Khám phá tất cả khóa học
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

