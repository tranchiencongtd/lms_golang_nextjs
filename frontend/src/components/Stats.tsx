import { Users, BookOpen, Award, Star } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '50,000+',
    label: 'học sinh đang học',
  },
  {
    icon: BookOpen,
    value: '500+',
    label: 'Khóa học & Bài giảng',
  },
  {
    icon: Star,
    value: '100+',
    label: 'Giáo viên giỏi',
  },
  {
    icon: Award,
    value: '95%',
    label: 'học sinh hài lòng',
  },
]

export default function Stats() {
  return (
    <section className="py-10 lg:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              {/* Icon */}
              <div className="w-12 h-12 bg-primary-100 mx-auto flex items-center justify-center mb-4">
                <stat.icon className="w-6 h-6 text-primary-500" />
              </div>

              {/* Value */}
              <div className="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-2">
                {stat.value}
              </div>

              {/* Label */}
              <div className="text-sm text-secondary-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
