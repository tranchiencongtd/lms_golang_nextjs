import Link from 'next/link'
import { Star, ArrowRight, BookOpen, Clock } from 'lucide-react'

const courses = [
  {
    id: 1,
    title: 'Toán lớp 12 - Ôn thi THPT Quốc gia',
    instructor: 'Thầy Nguyễn Văn A',
    rating: 4.9,
    students: 12500,
    lessons: 120,
    duration: '60 giờ',
    price: 1200000,
    originalPrice: 2000000,
    badge: 'Bestseller',
    badgeColor: 'bg-accent-orange',
  },
  {
    id: 2,
    title: 'Hình học không gian từ A-Z',
    instructor: 'Cô Trần Thị B',
    rating: 4.8,
    students: 8900,
    lessons: 85,
    duration: '42 giờ',
    price: 800000,
    originalPrice: 1500000,
    badge: 'Hot',
    badgeColor: 'bg-red-500',
  },
  {
    id: 3,
    title: 'Đại số tuyến tính cơ bản',
    instructor: 'Thầy Lê Văn C',
    rating: 4.7,
    students: 4500,
    lessons: 65,
    duration: '32 giờ',
    price: 600000,
    originalPrice: 1000000,
    badge: 'Mới',
    badgeColor: 'bg-accent-green',
  },
  {
    id: 4,
    title: 'Luyện đề thi thử THPT Quốc gia',
    instructor: 'Đội ngũ MathVN',
    rating: 4.9,
    students: 15000,
    lessons: 100,
    duration: '50 giờ',
    price: 1000000,
    originalPrice: 1800000,
    badge: 'Phổ biến',
    badgeColor: 'bg-primary-500',
  },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

function CourseCard({ course }: { course: typeof courses[0] }) {
  return (
    <Link href={`/khoa-hoc/${course.id}`} className="group block h-full">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-video bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-primary-400">
            <BookOpen className="w-12 h-12" />
          </div>
          {course.badge && (
            <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold text-white rounded ${course.badgeColor}`}>
              {course.badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-secondary-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[2.75rem]">
            {course.title}
          </h3>
          <p className="text-sm text-secondary-500 mb-2">{course.instructor}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-secondary-900">{course.rating}</span>
            </div>
            <span className="text-sm text-secondary-400">({course.students.toLocaleString()} học sinh)</span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-secondary-500 mb-3">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{course.lessons} bài</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{course.duration}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-auto pt-2">
            <span className="text-lg font-bold text-secondary-900">{formatPrice(course.price)}</span>
            <span className="text-sm text-secondary-400 line-through">{formatPrice(course.originalPrice)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Courses() {
  return (
    <section id="courses" className="py-12 lg:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-heading">
              Khóa học phổ biến nhất
            </h2>
            <p className="section-subheading">
              Các khóa học được học sinh đánh giá cao và tin dùng.
            </p>
          </div>
          <Link 
            href="/khoa-hoc" 
            className="hidden md:inline-flex items-center gap-2 text-primary-500 font-semibold hover:text-primary-600 cursor-pointer"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Courses Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="md:hidden text-center mt-8">
          <Link href="/khoa-hoc" className="btn-secondary">
            Xem tất cả khóa học
          </Link>
        </div>
      </div>
    </section>
  )
}
