'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight, X, MoreHorizontal } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CourseCard, { CourseCardModel } from '@/components/CourseCard'
import { getCourses, type Course as ApiCourse } from '@/lib/api/courses'
import { formatDuration } from '@/lib/utils'

const ITEMS_PER_PAGE = 6

const grades = [
  { id: 'all', name: 'Tất cả' },
  { id: '1', name: 'Toán 1' },
  { id: '2', name: 'Toán 2' },
  { id: '3', name: 'Toán 3' },
  { id: '4', name: 'Toán 4' },
  { id: '5', name: 'Toán 5' },
  { id: '6', name: 'Toán 6' },
  { id: '7', name: 'Toán 7' },
  { id: '8', name: 'Toán 8' },
  { id: '9', name: 'Toán 9' },
  { id: '10', name: 'Toán 10' },
  { id: '11', name: 'Toán 11' },
  { id: '12', name: 'Toán 12' },
]

const levels = [
  { id: 'all', name: 'Tất cả trình độ' },
  { id: 'basic', name: 'Cơ bản' },
  { id: 'advanced', name: 'Nâng cao' },
]

function toCourseCardModel(course: ApiCourse): CourseCardModel {
  const duration = course.duration_minutes > 0 ? formatDuration(`${course.duration_minutes}:00`) : ''
  return {
    slug: course.slug || course.id,
    title: course.title,
    instructor: course.instructor?.full_name || 'Thầy Trần Chiến',
    rating: course.rating || 0,
    reviews: course.total_reviews || 0,
    students: course.total_students || 0,
    lessons: course.total_lessons || 0,
    duration,
    price: course.price || 0,
    originalPrice: course.original_price,
    image: course.image_url,
    grade: course.grade,
    level: course.level,
  }
}

// Loading fallback for Suspense
function CoursesLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-secondary-200 rounded-lg overflow-hidden animate-pulse">
                {/* Image skeleton */}
                <div className="aspect-video bg-gray-200" />
                {/* Content skeleton */}
                <div className="p-4">
                  {/* Title - 2 lines */}
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  {/* Instructor */}
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-4 bg-gray-200 rounded w-8" />
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </div>
                  {/* Meta */}
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
                  {/* Price */}
                  <div className="pt-3 border-t border-secondary-100">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-200 animate-pulse">
            {/* Info text skeleton */}
            <div className="h-4 bg-gray-200 rounded w-48" />
            {/* Pagination controls skeleton */}
            <div className="flex items-center gap-1">
              <div className="h-10 bg-gray-200 rounded w-16" />
              <div className="h-10 bg-gray-200 rounded w-10" />
              <div className="h-10 bg-gray-200 rounded w-10" />
              <div className="h-10 bg-gray-200 rounded w-10" />
              <div className="h-10 bg-gray-200 rounded w-16" />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

// Main page component with Suspense wrapper
export default function CoursesClient() {
  return (
    <Suspense fallback={<CoursesLoading />}>
      <CoursesContent />
    </Suspense>
  )
}

function CoursesContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [courses, setCourses] = useState<CourseCardModel[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true) // Initial load only
  const [isFetching, setIsFetching] = useState(false) // For page changes
  const [error, setError] = useState<string | null>(null)

  const sortOptions = [
    { id: 'popular', name: 'Phổ biến nhất' },
    { id: 'newest', name: 'Mới nhất' },
    { id: 'rating', name: 'Đánh giá cao nhất' },
    { id: 'price-low', name: 'Giá thấp đến cao' },
    { id: 'price-high', name: 'Giá cao đến thấp' },
  ]

  // Read URL params on load
  useEffect(() => {
    const gradeParam = searchParams.get('grade')
    const levelParam = searchParams.get('level')
    const pageParam = searchParams.get('page')
    const searchParam = searchParams.get('search')

    if (gradeParam) {
      setSelectedGrades(gradeParam.split(','))
    }
    if (levelParam) {
      setSelectedLevels(levelParam.split(','))
    }
    if (pageParam) {
      const page = parseInt(pageParam, 10)
      if (!isNaN(page) && page > 0) {
        setCurrentPage(page)
      }
    }
    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [searchParams])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedGrades, selectedLevels, sortBy])

  // Fetch courses from API whenever filters or page changes
  useEffect(() => {
    const fetchCourses = async () => {
      // Only show full skeleton on initial load (no courses yet)
      if (courses.length === 0) {
        setIsLoading(true)
      } else {
        setIsFetching(true) // Soft loading for page changes
      }
      setError(null)

      const sortMap: Record<string, any> = {
        popular: 'students_desc',
        newest: 'created_at_desc',
        rating: 'rating_desc',
        'price-low': 'price_asc',
        'price-high': 'price_desc',
      }

      const grade = selectedGrades.length ? selectedGrades.join(',') : undefined
      const level = selectedLevels.length ? selectedLevels.join(',') : undefined

      try {
        const res = await getCourses({
          search: searchQuery || undefined,
          grade: grade,
          level: level as any,
          sort: sortMap[sortBy] || 'students_desc',
          page: currentPage,
          page_size: ITEMS_PER_PAGE,
        })

        setCourses(res.courses.map(toCourseCardModel))
        setTotal(res.pagination.total)
        setTotalPages(res.pagination.total_pages || Math.ceil(res.pagination.total / ITEMS_PER_PAGE))
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'Không thể tải danh sách khóa học'
        setError(msg)
        setCourses([])
        setTotal(0)
        setTotalPages(1)
      } finally {
        setIsLoading(false)
        setIsFetching(false)
      }
    }

    fetchCourses()
  }, [searchQuery, selectedGrades, selectedLevels, sortBy, currentPage])

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    setCurrentPage(page)
  }

  // Generate pagination range with ellipsis
  const getPaginationRange = () => {
    const delta = 1 // Number of pages around current page
    const range: (number | 'ellipsis')[] = []

    // Always show first page
    range.push(1)

    if (totalPages <= 7) {
      // Show all pages if total is small
      for (let i = 2; i <= totalPages; i++) {
        range.push(i)
      }
    } else {
      // Calculate left and right boundaries around current page
      const left = Math.max(2, currentPage - delta)
      const right = Math.min(totalPages - 1, currentPage + delta)

      // Add ellipsis after first page if needed
      if (left > 2) {
        range.push('ellipsis')
      }

      // Add pages around current page
      for (let i = left; i <= right; i++) {
        range.push(i)
      }

      // Add ellipsis before last page if needed
      if (right < totalPages - 1) {
        range.push('ellipsis')
      }

      // Always show last page
      if (totalPages > 1) {
        range.push(totalPages)
      }
    }

    return range
  }

  // Toggle functions for multi-select
  const toggleGrade = (gradeId: string) => {
    setSelectedGrades(prev =>
      prev.includes(gradeId)
        ? prev.filter(g => g !== gradeId)
        : [...prev, gradeId]
    )
  }

  const toggleLevel = (levelId: string) => {
    setSelectedLevels(prev =>
      prev.includes(levelId)
        ? prev.filter(l => l !== levelId)
        : [...prev, levelId]
    )
  }

  const activeFiltersCount = selectedGrades.length + selectedLevels.length
  const skeletonItems = Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => idx)
  const paginationRange = getPaginationRange()

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Banner Section */}
      <section className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative w-full aspect-[4/1] bg-gradient-to-r from-primary-200 to-primary-100 rounded-lg overflow-hidden">
            {/* Placeholder - Replace with actual banner image */}
            <div className="absolute inset-0 flex items-center justify-center text-primary-400">
              <span className="text-lg font-medium">Banner quảng cáo (1200 x 300)</span>
            </div>
            {/* <Image src="/images/banner-khoa-hoc.jpg" alt="Banner" fill className="object-cover" /> */}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                {/* Search Input */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm khóa học..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-secondary-700 placeholder-secondary-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-secondary-900 mb-4">Bộ lọc</h3>

                {/* Grade Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-secondary-700 mb-3">Lớp</h4>
                  <div className="space-y-2">
                    {grades.filter(g => g.id !== 'all').map((grade) => (
                      <label key={grade.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedGrades.includes(grade.id)}
                          onChange={() => toggleGrade(grade.id)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className={`text-sm ${selectedGrades.includes(grade.id) ? 'text-primary-600 font-medium' : 'text-secondary-600 group-hover:text-secondary-900'}`}>{grade.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 mb-3">Trình độ</h4>
                  <div className="space-y-2">
                    {levels.filter(l => l.id !== 'all').map((level) => (
                      <label key={level.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedLevels.includes(level.id)}
                          onChange={() => toggleLevel(level.id)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className={`text-sm ${selectedLevels.includes(level.id) ? 'text-primary-600 font-medium' : 'text-secondary-600 group-hover:text-secondary-900'}`}>{level.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setSelectedGrades([])
                    setSelectedLevels([])
                    setSearchQuery('')
                  }}
                  className={`w-full mt-6 py-2 text-sm rounded transition-colors ${(activeFiltersCount > 0 || searchQuery) ? 'bg-primary-50 text-primary-600 hover:bg-primary-100' : 'text-secondary-400 cursor-not-allowed'}`}
                  disabled={activeFiltersCount === 0 && !searchQuery}
                >
                  Xóa bộ lọc {(activeFiltersCount > 0 || searchQuery) && `(${activeFiltersCount + (searchQuery ? 1 : 0)})`}
                </button>
              </div>
            </aside>

            {/* Course Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center justify-between gap-x-4">
                  {activeFiltersCount > 0 && (
                    <p className="text-secondary-600 flex-2">
                      <span className="font-semibold text-secondary-900">{total}</span> khóa học
                    </p>
                  )}

                  {/* Active Filters Tags */}
                  {(activeFiltersCount > 0 || searchQuery) && (
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <span className="text-sm text-secondary-500">{searchQuery ? 'Tìm kiếm:' : 'Đang lọc:'}</span>
                      {/* Search Query Tag */}
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 text-sm rounded-full hover:bg-green-100"
                        >
                          "{searchQuery}"
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      {selectedGrades.map(gradeId => {
                        const grade = grades.find(g => g.id === gradeId)
                        return grade ? (
                          <button
                            key={gradeId}
                            onClick={() => toggleGrade(gradeId)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-600 text-sm rounded-full hover:bg-primary-100"
                          >
                            {grade.name}
                            <X className="w-3 h-3" />
                          </button>
                        ) : null
                      })}
                      {selectedLevels.map(levelId => {
                        const level = levels.find(l => l.id === levelId)
                        return level ? (
                          <button
                            key={levelId}
                            onClick={() => toggleLevel(levelId)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-accent-orange/10 text-accent-orange text-sm rounded-full hover:bg-accent-orange/20"
                          >
                            {level.name}
                            <X className="w-3 h-3" />
                          </button>
                        ) : null
                      })}
                      <button
                        onClick={() => {
                          setSelectedGrades([])
                          setSelectedLevels([])
                          setSearchQuery('')
                        }}
                        className="text-sm text-secondary-500 hover:text-secondary-700 underline ml-2"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                  )}
                </div>


                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 relative"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">Bộ lọc</span>
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary-500 cursor-pointer"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
                  </div>
                </div>
              </div>



              {/* Mobile Filters */}
              {showFilters && (
                <div className="lg:hidden bg-white rounded-lg border border-gray-200 p-4 mb-6">
                  {/* Search Input (Mobile) */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm khóa học..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-secondary-700 placeholder-secondary-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grade Section */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-secondary-700 mb-2">Lớp</h4>
                    <div className="flex flex-wrap gap-2">
                      {grades.filter(g => g.id !== 'all').map((grade) => (
                        <button
                          key={grade.id}
                          onClick={() => toggleGrade(grade.id)}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${selectedGrades.includes(grade.id)
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-white text-secondary-600 border-gray-200 hover:border-primary-500'
                            }`}
                        >
                          {grade.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Level Section */}
                  <div>
                    <h4 className="text-sm font-medium text-secondary-700 mb-2">Trình độ</h4>
                    <div className="flex flex-wrap gap-2">
                      {levels.filter(l => l.id !== 'all').map((level) => (
                        <button
                          key={level.id}
                          onClick={() => toggleLevel(level.id)}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${selectedLevels.includes(level.id)
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-white text-secondary-600 border-gray-200 hover:border-primary-500'
                            }`}
                        >
                          {level.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Course Grid */}
              {isLoading ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {skeletonItems.map((idx) => (
                      <div key={idx} className="bg-white border border-secondary-200 rounded-lg overflow-hidden animate-pulse">
                        {/* Image skeleton */}
                        <div className="aspect-video bg-gray-200" />
                        {/* Content skeleton */}
                        <div className="p-4">
                          {/* Title - 2 lines */}
                          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                          {/* Instructor */}
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-4 bg-gray-200 rounded w-8" />
                            <div className="h-4 bg-gray-200 rounded w-20" />
                          </div>
                          {/* Meta */}
                          <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
                          {/* Price */}
                          <div className="pt-3 border-t border-secondary-100">
                            <div className="h-5 bg-gray-200 rounded w-1/3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination skeleton */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-200 animate-pulse">
                    {/* Info text skeleton */}
                    <div className="h-4 bg-gray-200 rounded w-48" />
                    {/* Pagination controls skeleton */}
                    <div className="flex items-center gap-1">
                      <div className="h-10 bg-gray-200 rounded w-16" />
                      <div className="h-10 bg-gray-200 rounded w-10" />
                      <div className="h-10 bg-gray-200 rounded w-10" />
                      <div className="h-10 bg-gray-200 rounded w-10" />
                      <div className="h-10 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                </>
              ) : error ? (
                <div className="text-center py-16">
                  {/* <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-red-400" />
                  </div> */}
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Không thể tải khóa học
                  </h3>
                  <p className="text-secondary-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-primary-600 font-medium hover:underline"
                  >
                    Thử lại
                  </button>
                </div>
              ) : courses.length > 0 ? (
                <div className="relative">
                  {/* Loading overlay for page changes */}
                  {isFetching && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-lg">
                      <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-lg">
                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-secondary-600">Đang tải...</span>
                      </div>
                    </div>
                  )}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
                    {courses.map((course) => (
                      <CourseCard key={course.slug} course={course} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Không tìm thấy khóa học
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedGrades([])
                      setSelectedLevels([])
                    }}
                    className="text-primary-600 font-medium hover:underline"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}

              {/* Pagination */}
              {!isLoading && !error && courses.length > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-200">
                  {/* Info text */}
                  <div className="text-sm text-secondary-600">
                    Hiển thị {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, total)} trên {total} khóa học
                  </div>

                  {/* Pagination controls */}
                  <div className="flex items-center gap-1">
                    {/* Previous button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-all ${currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-secondary-600 hover:bg-gray-100 hover:text-secondary-900'
                        }`}
                      aria-label="Trang trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Trước</span>
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {paginationRange.map((item, idx) => {
                        if (item === 'ellipsis') {
                          return (
                            <span
                              key={`ellipsis-${idx}`}
                              className="w-10 h-10 flex items-center justify-center text-secondary-400"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </span>
                          )
                        }

                        const page = item as number
                        const isActive = page === currentPage

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-all ${isActive
                              ? 'bg-primary-600 text-white shadow-sm'
                              : 'text-secondary-600 hover:bg-gray-100 hover:text-secondary-900'
                              }`}
                            aria-label={`Trang ${page}`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {page}
                          </button>
                        )
                      })}
                    </div>

                    {/* Next button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-all ${currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-secondary-600 hover:bg-gray-100 hover:text-secondary-900'
                        }`}
                      aria-label="Trang sau"
                    >
                      <span className="hidden sm:inline">Sau</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main >
  )
}
