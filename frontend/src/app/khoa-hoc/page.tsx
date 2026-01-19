'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Search, Filter, ChevronDown, X } from 'lucide-react'
import CourseCard, { Course } from '@/components/CourseCard'

const grades = [
  { id: 'all', name: 'Tất cả' },
  { id: '6', name: 'Lớp 6' },
  { id: '7', name: 'Lớp 7' },
  { id: '8', name: 'Lớp 8' },
  { id: '9', name: 'Lớp 9' },
  { id: '10', name: 'Lớp 10' },
  { id: '11', name: 'Lớp 11' },
  { id: '12', name: 'Lớp 12' },
]

const topics = [
  { id: 'all', name: 'Tất cả chủ đề' },
  { id: 'dai-so', name: 'Đại số' },
  { id: 'hinh-hoc', name: 'Hình học' },
  { id: 'luyen-thi-thpt', name: 'Luyện thi THPT' },
]

const levels = [
  { id: 'all', name: 'Tất cả trình độ' },
  { id: 'basic', name: 'Cơ bản' },
  { id: 'intermediate', name: 'Nâng cao' },
]

const courses: Course[] = [
  {
    id: 1,
    title: 'Toán lớp 12 - Luyện thi THPT Quốc Gia',
    instructor: 'Thầy Nguyễn Văn A',
    rating: 4.9,
    reviews: 3200,
    students: 12500,
    lessons: 120,
    duration: '60 giờ',
    price: 1200000,
    originalPrice: 2000000,
    image: '/images/course-1.jpg',
    grade: '12',
    topic: 'giai-tich',
    level: 'advanced',
    badge: 'Bestseller',
    badgeColor: 'bg-accent-orange',
  },
  {
    id: 2,
    title: 'Hình học không gian - Từ cơ bản đến nâng cao',
    instructor: 'Cô Trần Thị B',
    rating: 4.8,
    reviews: 2100,
    students: 8900,
    lessons: 85,
    duration: '42 giờ',
    price: 800000,
    originalPrice: 1500000,
    image: '/images/course-2.jpg',
    grade: '11',
    topic: 'hinh-hoc',
    level: 'intermediate',
    badge: 'Hot',
    badgeColor: 'bg-red-500',
  },
  {
    id: 3,
    title: 'Đại số tuyến tính cho học sinh THPT',
    instructor: 'Thầy Lê Văn C',
    rating: 4.7,
    reviews: 1500,
    students: 6500,
    lessons: 65,
    duration: '32 giờ',
    price: 600000,
    originalPrice: 1000000,
    image: '/images/course-3.jpg',
    grade: '10',
    topic: 'dai-so',
    level: 'basic',
    badge: 'Mới',
    badgeColor: 'bg-accent-green',
  },
  {
    id: 4,
    title: 'Lượng giác toàn tập - Công thức & Bài tập',
    instructor: 'Thầy Phạm Văn D',
    rating: 4.9,
    reviews: 2800,
    students: 10200,
    lessons: 95,
    duration: '48 giờ',
    price: 900000,
    originalPrice: 1600000,
    image: '/images/course-4.jpg',
    grade: '11',
    topic: 'luong-giac',
    level: 'intermediate',
    badge: 'Bestseller',
    badgeColor: 'bg-accent-orange',
  },
  {
    id: 5,
    title: 'Toán lớp 9 - Ôn thi vào lớp 10 chuyên',
    instructor: 'Cô Nguyễn Thị E',
    rating: 4.8,
    reviews: 4200,
    students: 15000,
    lessons: 100,
    duration: '50 giờ',
    price: 1000000,
    originalPrice: 1800000,
    image: '/images/course-5.jpg',
    grade: '9',
    topic: 'dai-so',
    level: 'advanced',
    badge: 'Hot',
    badgeColor: 'bg-red-500',
  },
  {
    id: 6,
    title: 'Xác suất thống kê - Lớp 10, 11, 12',
    instructor: 'Thầy Hoàng Văn F',
    rating: 4.6,
    reviews: 890,
    students: 4500,
    lessons: 55,
    duration: '28 giờ',
    price: 500000,
    originalPrice: 900000,
    image: '/images/course-6.jpg',
    grade: '10',
    topic: 'xac-suat',
    level: 'basic',
    badge: null,
    badgeColor: null,
  },
  {
    id: 7,
    title: 'Toán lớp 6 - Nền tảng vững chắc',
    instructor: 'Cô Lê Thị G',
    rating: 4.9,
    reviews: 2400,
    students: 8000,
    lessons: 80,
    duration: '40 giờ',
    price: 400000,
    originalPrice: 700000,
    image: '/images/course-7.jpg',
    grade: '6',
    topic: 'dai-so',
    level: 'basic',
    badge: 'Phổ biến',
    badgeColor: 'bg-primary-500',
  },
  {
    id: 8,
    title: 'Giải tích 12 - Chinh phục điểm 9, 10',
    instructor: 'Thầy Nguyễn Văn H',
    rating: 4.8,
    reviews: 3100,
    students: 11000,
    lessons: 110,
    duration: '55 giờ',
    price: 1100000,
    originalPrice: 1900000,
    image: '/images/course-8.jpg',
    grade: '12',
    topic: 'giai-tich',
    level: 'advanced',
    badge: 'Bestseller',
    badgeColor: 'bg-accent-orange',
  },
]


function CoursesPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)

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
    const topicParam = searchParams.get('topic')
    const levelParam = searchParams.get('level')

    if (gradeParam) {
      setSelectedGrades(gradeParam.split(','))
    }
    if (topicParam) {
      setSelectedTopics(topicParam.split(','))
    }
    if (levelParam) {
      setSelectedLevels(levelParam.split(','))
    }
  }, [searchParams])

  // Toggle functions for multi-select
  const toggleGrade = (gradeId: string) => {
    setSelectedGrades(prev => 
      prev.includes(gradeId) 
        ? prev.filter(g => g !== gradeId)
        : [...prev, gradeId]
    )
  }

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    )
  }

  const toggleLevel = (levelId: string) => {
    setSelectedLevels(prev => 
      prev.includes(levelId) 
        ? prev.filter(l => l !== levelId)
        : [...prev, levelId]
    )
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGrade = selectedGrades.length === 0 || (course.grade && selectedGrades.includes(course.grade))
    const matchesTopic = selectedTopics.length === 0 || (course.topic && selectedTopics.includes(course.topic))
    const matchesLevel = selectedLevels.length === 0 || (course.level && selectedLevels.includes(course.level))
    return matchesSearch && matchesGrade && matchesTopic && matchesLevel
  })

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.students || 0) - (a.students || 0)
      case 'newest':
        return b.id - a.id // Assuming higher ID = newer
      case 'rating':
        return b.rating - a.rating
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      default:
        return 0
    }
  })

  const activeFiltersCount = selectedGrades.length + selectedTopics.length + selectedLevels.length

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

                {/* Topic Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-secondary-700 mb-3">Chủ đề</h4>
                  <div className="space-y-2">
                    {topics.filter(t => t.id !== 'all').map((topic) => (
                      <label key={topic.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedTopics.includes(topic.id)}
                          onChange={() => toggleTopic(topic.id)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className={`text-sm ${selectedTopics.includes(topic.id) ? 'text-primary-600 font-medium' : 'text-secondary-600 group-hover:text-secondary-900'}`}>{topic.name}</span>
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
                    setSelectedTopics([])
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
                <p className="text-secondary-600">
                  <span className="font-semibold text-secondary-900">{filteredCourses.length}</span> khóa học
                </p>

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

              {/* Active Filters Tags */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
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
                  {selectedTopics.map(topicId => {
                    const topic = topics.find(t => t.id === topicId)
                    return topic ? (
                      <button
                        key={topicId}
                        onClick={() => toggleTopic(topicId)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-accent-green/10 text-accent-green text-sm rounded-full hover:bg-accent-green/20"
                      >
                        {topic.name}
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
                      setSelectedTopics([])
                      setSelectedLevels([])
                    }}
                    className="text-sm text-secondary-500 hover:text-secondary-700 underline ml-2"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}

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
                          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                            selectedGrades.includes(grade.id)
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'bg-white text-secondary-600 border-gray-200 hover:border-primary-500'
                          }`}
                        >
                          {grade.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Topic Section */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-secondary-700 mb-2">Chủ đề</h4>
                    <div className="flex flex-wrap gap-2">
                      {topics.filter(t => t.id !== 'all').map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => toggleTopic(topic.id)}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                            selectedTopics.includes(topic.id)
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'bg-white text-secondary-600 border-gray-200 hover:border-primary-500'
                          }`}
                        >
                          {topic.name}
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
                          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                            selectedLevels.includes(level.id)
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
              {sortedCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
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
                      setSelectedTopics([])
                      setSelectedLevels([])
                    }}
                    className="text-primary-600 font-medium hover:underline"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}

              {/* Load More */}
              {sortedCourses.length > 0 && (
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

export default function CoursesPageWrapper() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
        <Footer />
      </main>
    }>
      <CoursesPage />
    </Suspense>
  )
}
