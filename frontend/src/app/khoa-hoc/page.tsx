'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, ChevronDown, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CourseCard, { CourseCardModel } from '@/components/CourseCard'
import { getCourses, type Course as ApiCourse } from '@/lib/api/courses'
import { formatDuration } from '@/lib/utils'

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
    instructor: course.instructor?.full_name || 'Giảng viên MathVN',
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


export default function CoursesPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [courses, setCourses] = useState<CourseCardModel[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
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

    if (gradeParam) {
      setSelectedGrades(gradeParam.split(','))
    }
    if (levelParam) {
      setSelectedLevels(levelParam.split(','))
    }
  }, [searchParams])

  // Fetch courses from API whenever filters change
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)
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
          page: 1,
          page_size: 6,
        })

        setCourses(res.courses.map(toCourseCardModel))
        setTotal(res.pagination.total)
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'Không thể tải danh sách khóa học'
        setError(msg)
        setCourses([])
        setTotal(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [searchQuery, selectedGrades, selectedLevels, sortBy])

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
  const skeletonItems = Array.from({ length: 6 }).map((_, idx) => idx)

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
                  }}
                  className={`w-full mt-6 py-2 text-sm rounded transition-colors ${activeFiltersCount > 0 ? 'bg-primary-50 text-primary-600 hover:bg-primary-100' : 'text-secondary-400 cursor-not-allowed'}`}
                  disabled={activeFiltersCount === 0}
                >
                  Xóa bộ lọc {activeFiltersCount > 0 && `(${activeFiltersCount})`}
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
                  {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <span className="text-sm text-secondary-500">Đang lọc:</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {skeletonItems.map((idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse space-y-3">
                      <div className="aspect-video bg-gray-200 rounded-md" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-5 bg-gray-200 rounded w-1/3 mt-4" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-red-400" />
                  </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard key={course.slug} course={course} />
                  ))}
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

              {/* Load More */}
              {courses.length > 0 && (
                <div className="text-center mt-10">
                  <button className="px-8 py-3 border border-primary-500 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors">
                    Xem thêm khóa học
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

