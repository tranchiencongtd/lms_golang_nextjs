import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import CourseCard, { Course } from '@/components/CourseCard'

const courses: Course[] = [
  {
    id: 1,
    title: 'Toán lớp 12 - Ôn thi THPT Quốc gia',
    instructor: 'Thầy Nguyễn Văn A',
    rating: 4.9,
    reviews: 3200,
    students: 12500,
    lessons: 120,
    duration: '60 giờ',
    price: 1200000,
    originalPrice: 2000000,
    badge: 'Bestseller',
    badgeColor: 'bg-primary-600',
  },
  {
    id: 2,
    title: 'Hình học không gian từ A-Z',
    instructor: 'Cô Trần Thị B',
    rating: 4.8,
    reviews: 2100,
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
    reviews: 980,
    students: 4500,
    lessons: 65,
    duration: '32 giờ',
    price: 600000,
    originalPrice: 1000000,
    badge: 'Mới',
    badgeColor: 'bg-green-600',
  },
  {
    id: 4,
    title: 'Luyện đề thi thử THPT Quốc gia',
    instructor: 'Đội ngũ MathVN',
    rating: 4.9,
    reviews: 4500,
    students: 15000,
    lessons: 100,
    duration: '50 giờ',
    price: 1000000,
    originalPrice: 1800000,
    badge: 'Phổ biến',
    badgeColor: 'bg-primary-600',
  },
]

export default function Courses() {
  return (
    <section id="courses" className="pb-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-900">
              Khóa học phổ biến nhất
            </h2>
           
          </div>
          <p className="text-lg text-secondary-600 max-w-2xl">
            Các khóa học được học sinh đánh giá cao và tin dùng nhất.
          </p>
        </div>

        {/* Courses Grid */}
        <div>
          <div className='flex justify-end mb-3 group'>
            <Link 
                  href="/khoa-hoc" 
                  className=" text-left hidden md:inline-flex items-center gap-2 text-primary-600 font-semibold group-hover:text-primary-700 transition-colors"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
       
        {/* Mobile View All */}
        <div className="md:hidden text-center mt-10">
          <Link 
            href="/khoa-hoc" 
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-secondary-300 text-secondary-700 font-semibold rounded-lg hover:border-secondary-400 hover:bg-secondary-50 transition-colors"
          >
            Xem tất cả khóa học
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
