'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  Star, 
  Clock, 
  BookOpen, 
  Users, 
  Play, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Award,
  FileText,
  Download,
  Globe,
  Shield,
  ArrowLeft
} from 'lucide-react'

// Mock course data - In real app, fetch from API
const coursesData: Record<string, {
  id: number
  title: string
  instructor: string
  instructorTitle: string
  instructorAvatar: string
  rating: number
  students: number
  reviews: number
  lessons: number
  duration: string
  price: number
  originalPrice: number
  description: string
  whatYouLearn: string[]
  requirements: string[]
  curriculum: { title: string; lessons: { title: string; duration: string; preview?: boolean }[] }[]
  badge: string | null
  badgeColor: string | null
  level: string
  language: string
  lastUpdated: string
  certificate: boolean
}> = {
  '1': {
    id: 1,
    title: 'Toán lớp 12 - Luyện thi THPT Quốc Gia',
    instructor: 'Thầy Nguyễn Văn A',
    instructorTitle: 'Giáo viên Toán THPT chuyên, 15 năm kinh nghiệm',
    instructorAvatar: '',
    rating: 4.9,
    students: 12500,
    reviews: 3200,
    lessons: 120,
    duration: '60 giờ',
    price: 1200000,
    originalPrice: 2000000,
    description: 'Khóa học Toán lớp 12 toàn diện, được thiết kế đặc biệt để giúp học sinh chuẩn bị tốt nhất cho kỳ thi THPT Quốc Gia. Với phương pháp giảng dạy khoa học, bài giảng sinh động và hệ thống bài tập đa dạng từ cơ bản đến nâng cao.',
    whatYouLearn: [
      'Nắm vững toàn bộ kiến thức Toán lớp 12 theo chương trình mới',
      'Giải thành thạo các dạng bài tập thường gặp trong đề thi',
      'Phương pháp làm bài nhanh, chính xác và hiệu quả',
      'Kỹ năng phân tích đề và quản lý thời gian làm bài',
      'Chiến lược ôn thi và đạt điểm cao trong kỳ thi THPT QG',
      'Tự tin giải quyết các bài toán từ cơ bản đến nâng cao',
    ],
    requirements: [
      'Đã học xong chương trình Toán lớp 11',
      'Máy tính hoặc điện thoại có kết nối internet',
      'Có tinh thần học tập nghiêm túc và kiên trì',
    ],
    curriculum: [
      {
        title: 'Chương 1: Ứng dụng đạo hàm',
        lessons: [
          { title: 'Giới thiệu khóa học', duration: '10:00', preview: true },
          { title: 'Sự đồng biến, nghịch biến của hàm số', duration: '45:00', preview: true },
          { title: 'Cực trị của hàm số', duration: '50:00' },
          { title: 'Giá trị lớn nhất, nhỏ nhất', duration: '40:00' },
          { title: 'Bài tập tổng hợp chương 1', duration: '60:00' },
        ],
      },
      {
        title: 'Chương 2: Hàm số mũ và logarit',
        lessons: [
          { title: 'Lũy thừa với số mũ thực', duration: '35:00' },
          { title: 'Hàm số mũ', duration: '40:00' },
          { title: 'Logarit', duration: '45:00' },
          { title: 'Hàm số logarit', duration: '40:00' },
          { title: 'Phương trình mũ và logarit', duration: '55:00' },
        ],
      },
      {
        title: 'Chương 3: Nguyên hàm - Tích phân',
        lessons: [
          { title: 'Nguyên hàm', duration: '50:00' },
          { title: 'Tích phân', duration: '55:00' },
          { title: 'Ứng dụng tích phân', duration: '60:00' },
          { title: 'Bài tập nâng cao', duration: '45:00' },
        ],
      },
      {
        title: 'Chương 4: Số phức',
        lessons: [
          { title: 'Số phức và các phép toán', duration: '40:00' },
          { title: 'Phương trình bậc hai với hệ số thực', duration: '35:00' },
          { title: 'Dạng lượng giác của số phức', duration: '45:00' },
        ],
      },
    ],
    badge: 'Bestseller',
    badgeColor: 'bg-accent-orange',
    level: 'Nâng cao',
    language: 'Tiếng Việt',
    lastUpdated: 'Tháng 1/2026',
  },
}

// Default course for IDs not in mock data
const defaultCourse = {
  id: 0,
  title: 'Khóa học Toán',
  instructor: 'Giảng viên MathVN',
  instructorTitle: 'Giáo viên Toán',
  instructorAvatar: '',
  rating: 4.8,
  students: 5000,
  reviews: 1200,
  lessons: 80,
  duration: '40 giờ',
  price: 800000,
  originalPrice: 1500000,
  description: 'Khóa học Toán chất lượng cao với phương pháp giảng dạy hiện đại, giúp học sinh nắm vững kiến thức và đạt điểm cao.',
  whatYouLearn: [
    'Nắm vững kiến thức cốt lõi',
    'Giải thành thạo các dạng bài tập',
    'Phương pháp làm bài hiệu quả',
    'Kỹ năng tự học và ôn tập',
  ],
  requirements: [
    'Có kiến thức nền tảng phù hợp',
    'Máy tính hoặc điện thoại có kết nối internet',
  ],
  curriculum: [
    {
      title: 'Phần 1: Kiến thức cơ bản',
      lessons: [
        { title: 'Giới thiệu khóa học', duration: '10:00', preview: true },
        { title: 'Bài 1: Nền tảng', duration: '45:00' },
        { title: 'Bài 2: Lý thuyết cơ bản', duration: '50:00' },
      ],
    },
    {
      title: 'Phần 2: Bài tập ứng dụng',
      lessons: [
        { title: 'Bài tập dạng 1', duration: '40:00' },
        { title: 'Bài tập dạng 2', duration: '45:00' },
        { title: 'Bài tập tổng hợp', duration: '60:00' },
      ],
    },
  ],
  badge: null,
  badgeColor: null,
  level: 'Trung bình',
  language: 'Tiếng Việt',
  lastUpdated: 'Tháng 1/2026',
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const course = coursesData[courseId] || { ...defaultCourse, id: parseInt(courseId) || 0 }
  
  const [expandedSections, setExpandedSections] = useState<number[]>([0])

  const toggleSection = (index: number) => {
    setExpandedSections(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const totalLessons = course.curriculum.reduce((acc, section) => acc + section.lessons.length, 0)
  const discount = Math.round((1 - course.price / course.originalPrice) * 100)

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/khoa-hoc" className="text-primary-600 hover:underline flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Khóa học
            </Link>
            <span className="text-secondary-400">/</span>
            <span className="text-secondary-600 line-clamp-1">{course.title}</span>
          </div>
        </div>
      </div>

      {/* Course Header + Content */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="lg:flex lg:gap-12">
            {/* Left: Course Info + Content */}
            <div className="lg:flex-1 space-y-8">
              {/* Course Header */}
              <div className="bg-white rounded-xl p-6 lg:p-8 ">
              {/* Badge & Level */}
              <div className="flex items-center gap-2 mb-4">
                {course.badge && (
                  <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${course.badgeColor}`}>
                    {course.badge}
                  </span>
                )}
                <span className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-full">
                  {course.level}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-4 leading-tight">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-secondary-600 mb-6 leading-relaxed">
                {course.description}
              </p>
              
              {/* Rating & Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 ">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= Math.floor(course.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} 
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-secondary-900">{course.rating}</span>
                  <span className="text-secondary-500">({course.reviews.toLocaleString()} đánh giá)</span>
                </div>
                <div className="flex items-center gap-1.5 text-secondary-600">
                  <Users className="w-4 h-4 text-primary-500" />
                  <span>{course.students.toLocaleString()} học sinh đã đăng ký</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-md">
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-secondary-900">{course.instructor}</p>
                  <p className="text-sm text-secondary-500">{course.instructorTitle}</p>
                </div>
              </div>

              {/* Meta Tags */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-secondary-600">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-secondary-600">
                  <BookOpen className="w-4 h-4 text-primary-500" />
                  <span>{course.lessons} bài học</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-secondary-600">
                  <Globe className="w-4 h-4 text-primary-500" />
                  <span>{course.language}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-secondary-600">
                  <FileText className="w-4 h-4 text-primary-500" />
                  <span>Cập nhật: {course.lastUpdated}</span>
                </div>
              </div>
              </div>

              {/* What You'll Learn */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Bạn sẽ học được gì</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.whatYouLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-secondary-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Yêu cầu</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-secondary-700">
                      <span className="w-1.5 h-1.5 bg-secondary-400 rounded-full mt-2 flex-shrink-0"></span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curriculum */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-secondary-900">Nội dung khóa học</h2>
                  <p className="text-sm text-secondary-500">
                    {course.curriculum.length} chương • {totalLessons} bài học • {course.duration}
                  </p>
                </div>

                <div className="space-y-3">
                  {course.curriculum.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(sectionIndex)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedSections.includes(sectionIndex) ? (
                            <ChevronUp className="w-5 h-5 text-secondary-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-secondary-500" />
                          )}
                          <span className="font-medium text-secondary-900">{section.title}</span>
                        </div>
                        <span className="text-sm text-secondary-500">{section.lessons.length} bài</span>
                      </button>

                      {/* Section Content */}
                      {expandedSections.includes(sectionIndex) && (
                        <div className="divide-y divide-gray-100">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-3">
                                <Play className="w-4 h-4 text-secondary-400" />
                                <span className="text-sm text-secondary-700">{lesson.title}</span>
                                {lesson.preview && (
                                  <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded">
                                    Xem trước
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-secondary-500">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Giảng viên</h2>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {course.instructor.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900 text-lg">{course.instructor}</h3>
                    <p className="text-secondary-500 mb-3">{course.instructorTitle}</p>
                    <div className="flex items-center gap-4 text-sm text-secondary-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{course.rating} đánh giá</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-secondary-400" />
                        <span>{course.students.toLocaleString()} học sinh</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-secondary-400" />
                        <span>5 khóa học</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Sticky Price Card */}
            <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
              <div className="sticky top-20">
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                  {/* Thumbnail */}
                  <div className="cursor-pointer relative aspect-video bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg mb-5 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IiMwMDU2RDIiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-50"></div>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform z-10">
                      <Play className="w-7 h-7 text-primary-600 ml-1" />
                    </div>
                    <span className="absolute bottom-3 right-3 bg-secondary-900/80 text-white text-xs px-2 py-1 rounded-md">
                      Xem giới thiệu
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-secondary-900">{formatPrice(course.price)}</span>
                    <span className="text-lg text-secondary-400 line-through">{formatPrice(course.originalPrice)}</span>
                  </div>
                  <div className="mb-5">
                    <span className="inline-block px-2 py-0.5 bg-red-50 text-red-600 text-sm font-medium rounded">
                      Tiết kiệm {discount}%
                    </span>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full btn-primary py-3.5 text-base font-semibold shadow-md hover:shadow-lg transition-shadow">
                    Mua ngay
                  </button>

                  {/* Features */}
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                    <p className="text-sm font-medium text-secondary-900 mb-3">Khóa học bao gồm:</p>
                    <div className="flex items-center gap-2.5 text-sm text-secondary-600">
                      <Clock className="w-4 h-4 text-primary-500" />
                      <span>{course.duration} video bài giảng</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-secondary-600">
                      <BookOpen className="w-4 h-4 text-primary-500" />
                      <span>{course.lessons} bài học chi tiết</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-secondary-600">
                      <Download className="w-4 h-4 text-primary-500" />
                      <span>Tài liệu & bài tập đi kèm</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-secondary-600">
                      <Shield className="w-4 h-4 text-primary-500" />
                      <span>Truy cập mọi thiết bị</span>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Price Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-secondary-900">{formatPrice(course.price)}</span>
              <span className="text-sm text-secondary-400 line-through">{formatPrice(course.originalPrice)}</span>
            </div>
            <span className="text-xs text-red-600 font-medium">Giảm {discount}%</span>
          </div>
          <button className="btn-primary py-3 px-6 font-semibold">
            Đăng ký ngay
          </button>
        </div>
      </div>

      {/* Add padding for mobile fixed bar */}
      <div className="lg:hidden h-24"></div>

      <Footer />
    </main>
  )
}
