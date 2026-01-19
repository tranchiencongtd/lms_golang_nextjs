'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import CourseCard, { CourseCardModel } from '@/components/CourseCard'
import { getCourses, type Course as ApiCourse } from '@/lib/api/courses'
import { formatDuration } from '@/lib/utils'

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
    badge: course.badge ?? null,
    badgeColor: course.badge_color ?? null,
    image: course.image_url,
    grade: course.grade,
    topic: course.topic,
    level: course.level,
  }
}

export default function Courses() {
  const [courses, setCourses] = useState<CourseCardModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getCourses({
          sort: 'students_desc',
          page: 1,
          page_size: 4,
        })
        setCourses(res.courses.map(toCourseCardModel))
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'Không thể tải khóa học'
        setError(msg)
        setCourses([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchFeatured()
  }, [])

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

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-full bg-white border border-secondary-200 rounded-lg p-4 animate-pulse">
                  <div className="aspect-video bg-secondary-100 rounded mb-4" />
                  <div className="h-4 bg-secondary-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-secondary-100 rounded w-1/2 mb-4" />
                  <div className="h-3 bg-secondary-100 rounded w-1/3 mb-6" />
                  <div className="h-5 bg-secondary-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 text-secondary-600">{error}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          )}
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
