import Link from 'next/link'
import { Star, BookOpen, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export interface Course {
  id: number
  title: string
  instructor: string
  rating: number
  reviews: number
  students?: number
  lessons: number
  duration: string
  price: number
  originalPrice: number
  badge?: string | null
  badgeColor?: string | null
  image?: string
  grade?: string
  topic?: string
  level?: string
}

interface CourseCardProps {
  course: Course
  className?: string
}

export default function CourseCard({ course, className = '' }: CourseCardProps) {
  // Calculate discount percentage
  const discount = course.originalPrice > course.price
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0

  return (
    <Link href={`/khoa-hoc/${course.id}`} className={`group block h-full ${className}`}>
      <div className="bg-white border border-secondary-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-video bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-primary-400">
            <BookOpen className="w-12 h-12" />
          </div>
          
          {/* Badge (left top) */}
          {course.badge && (
            <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold text-white rounded z-10 ${course.badgeColor || 'bg-primary-600'}`}>
              {course.badge}
            </span>
          )}
          
          {/* Discount Badge (right top) */}
          {discount > 0 && (
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded z-10">
              -{discount}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Title */}
          <h3 className="font-semibold text-base text-secondary-900 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[3rem] mb-2">
            {course.title}
          </h3>
          
          {/* Instructor */}
          <p className="text-sm text-secondary-500 mb-3">{course.instructor}</p>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-secondary-900">{course.rating}</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-xs text-secondary-500">({course.reviews.toLocaleString()} đánh giá)</span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-1 text-xs text-secondary-500 mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>{course.lessons} bài học · {course.duration}</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto pt-3 border-t border-secondary-100">
            <span className="text-lg font-bold text-secondary-900">{formatPrice(course.price)}</span>
            {course.originalPrice > course.price && (
              <span className="text-sm text-secondary-400 line-through">{formatPrice(course.originalPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
