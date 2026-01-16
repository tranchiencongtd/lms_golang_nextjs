'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Nguyễn Minh Anh',
    role: 'Học sinh lớp 12',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    content: 'Nhờ MathVN, em đã đạt 9.2 điểm môn Toán trong kỳ thi THPT Quốc gia. Các bài giảng rất dễ hiểu và có nhiều mẹo hay giúp em giải nhanh hơn.',
    program: 'Khóa luyện thi THPT Quốc Gia 2024',
    outcome: 'Đạt 9.2 điểm Toán - Đỗ ĐH Bách Khoa Hà Nội',
  },
  {
    id: 2,
    name: 'Trần Văn Hùng',
    role: 'Học sinh lớp 10',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    content: 'Em từng sợ môn Toán nhưng sau khi học với MathVN, em đã yêu thích và đạt điểm cao nhất lớp. Thầy cô giảng rất nhiệt tình và kiên nhẫn.',
    program: 'Toán lớp 10 - Chương trình cơ bản',
    outcome: 'Từ học sinh trung bình lên top 5 lớp',
  },
  {
    id: 3,
    name: 'Phạm Thu Hà',
    role: 'Phụ huynh',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    content: 'Con tôi đã tiến bộ rõ rệt sau 3 tháng học. Các bài tập có đáp án chi tiết giúp phụ huynh cũng có thể hỗ trợ con học tập tại nhà.',
    program: 'Toán THCS - Lớp 8',
    outcome: 'Con đạt giải Ba Toán cấp Quận',
  },
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section id="testimonials" className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-heading">
            học sinh nói gì về MathVN
          </h2>
          <p className="section-subheading max-w-2xl mx-auto">
            Hơn 50,000 học sinh và phụ huynh đã tin tưởng lựa chọn MathVN.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Card */}
          <div className="bg-white border border-secondary-200 p-8 md:p-12 relative">
            {/* Quote Icon */}
            <div className="absolute -top-5 left-8 w-10 h-10 bg-primary-500 flex items-center justify-center">
              <Quote className="w-5 h-5 text-white" />
            </div>

            {/* Content */}
            <div className="pt-4">
              {/* Quote */}
              <blockquote className="text-lg md:text-xl text-secondary-700 leading-relaxed mb-8">
                "{testimonials[currentIndex].content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-heading font-semibold text-secondary-900">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-sm text-secondary-500">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>

              {/* Program & Outcome */}
              <div className="pt-6 border-t border-secondary-100">
                <p className="text-sm text-secondary-500 mb-1">Khóa học đã hoàn thành:</p>
                <p className="text-primary-500 font-medium mb-3">
                  {testimonials[currentIndex].program}
                </p>
                <p className="text-sm text-accent-green font-medium">
                  ✓ {testimonials[currentIndex].outcome}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 border border-secondary-300 flex items-center justify-center hover:border-secondary-400 hover:bg-secondary-50 transition-all cursor-pointer"
              aria-label="Đánh giá trước"
            >
              <ChevronLeft className="w-5 h-5 text-secondary-600" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    index === currentIndex
                      ? 'bg-primary-500'
                      : 'bg-secondary-300 hover:bg-secondary-400'
                  }`}
                  aria-label={`Xem đánh giá ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-10 h-10 border border-secondary-300 flex items-center justify-center hover:border-secondary-400 hover:bg-secondary-50 transition-all cursor-pointer"
              aria-label="Đánh giá tiếp theo"
            >
              <ChevronRight className="w-5 h-5 text-secondary-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
