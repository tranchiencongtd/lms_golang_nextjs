import Link from 'next/link'
import { 
  GraduationCap, 
  Target, 
  Trophy, 
  ChevronRight,
  Users,
  Clock,
  Star
} from 'lucide-react'

const goals = [
  {
    icon: GraduationCap,
    title: 'Toán THCS',
    subtitle: 'Lớp 6 - 9',
    description: 'Chương trình toán lớp 6-9 với bài giảng sinh động và bài tập đa dạng.',
    link: '/khoa-hoc?grade=6,7,8,9',
    cta: 'Xem khóa học',
    gradient: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-50',
    iconColor: 'text-blue-600',
    students: '2,500+',
    rating: '4.8',
    popular: true,
  },
  {
    icon: Target,
    title: 'Toán THPT',
    subtitle: 'Lớp 10 - 12',
    description: 'Nắm vững kiến thức toán lớp 10-12, chuẩn bị tốt cho kỳ thi.',
    link: '/khoa-hoc?grade=10,11,12',
    cta: 'Xem khóa học',
    gradient: 'from-violet-500 to-purple-500',
    bgLight: 'bg-violet-50',
    iconColor: 'text-violet-600',
    students: '3,200+',
    rating: '4.9',
  },
  {
    icon: Trophy,
    title: 'Luyện thi THPT QG',
    subtitle: 'Ôn thi đại học',
    description: 'Đạt điểm cao với lộ trình ôn luyện bài bản và đề thi thử.',
    link: '/khoa-hoc?topic=luyen-thi-thpt',
    cta: 'Xem khoá học',
    gradient: 'from-orange-500 to-amber-500',
    bgLight: 'bg-violet-50',
    iconColor: 'text-violet-600',
    students: '5,000+',
    rating: '4.9',
    
  },
]

export default function Features() {
  return (
    <section id="features" className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-heading">
              Chọn lộ trình phù hợp với bạn
            </h2>
            <p className="section-subheading">
              Dù bạn đang học THCS, THPT hay chuẩn bị thi đại học, chúng tôi đều có khóa học phù hợp.
            </p>
          </div>
         
        </div>

        {/* Goals Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Link
              key={goal.title}
              href={goal.link}
              className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              {/* Popular badge */}
              {goal.popular && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold rounded-full">
                    Phổ biến
                  </span>
                </div>
              )}

              {/* Icon with gradient background */}
              <div className={`w-14 h-14 ${goal.bgLight} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <goal.icon className={`w-7 h-7 ${goal.iconColor}`} />
              </div>

              {/* Subtitle */}
              <span className="text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {goal.subtitle}
              </span>

              {/* Title */}
              <h3 className="text-xl font-heading font-bold text-secondary-900 mt-1 mb-3 group-hover:text-[#0056D2] transition-colors">
                {goal.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-secondary-600 mb-5 leading-relaxed">
                {goal.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-1.5 text-sm text-secondary-600">
                  <Users className="w-4 h-4 text-secondary-400" />
                  <span>{goal.students} học sinh</span>
                </div>
                {/* <div className="flex items-center gap-1.5 text-sm text-secondary-600">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{goal.rating}</span>
                </div> */}
              </div>

              {/* CTA */}
              <div className="flex items-center text-sm font-medium text-[#0056D2]">
                  <span>{goal.cta}</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${goal.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none`}></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
