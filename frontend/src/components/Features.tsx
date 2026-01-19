import Link from 'next/link'
import { 
  GraduationCap, 
  Target, 
  Trophy, 
  ArrowRight,
  Users
} from 'lucide-react'

const learningPaths = [
  {
    title: 'Toán THCS',
    subtitle: 'Lớp 6 - 9',
    description: 'Chương trình toán lớp 6-9 với bài giảng sinh động và bài tập đa dạng.',
    link: '/khoa-hoc?grade=6,7,8,9',
    students: '2,500+',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Toán THPT',
    subtitle: 'Lớp 10 - 12',
    description: 'Nắm vững kiến thức toán lớp 10-12, chuẩn bị tốt cho kỳ thi.',
    link: '/khoa-hoc?grade=10,11,12',
    students: '3,200+',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  {
    title: 'Luyện thi THPT QG',
    subtitle: 'Ôn thi đại học',
    description: 'Đạt điểm cao với lộ trình ôn luyện bài bản và đề thi thử.',
    link: '/khoa-hoc?topic=luyen-thi-thpt',
    students: '5,000+',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
]

export default function Features() {
  return (
    <section id="features" className="pt-16 lg:pt-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-4">
            Chọn khoá học phù hợp với bạn
          </h2>
          <p className="text-lg text-secondary-600 max-w-3xl">
            Dù bạn đang học THCS, THPT hay chuẩn bị thi đại học, chúng tôi đều có khóa học phù hợp.
          </p>
        </div>

        {/* Learning Paths Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPaths.map((path) => (
            <Link
              key={path.title}
              href={path.link}
              className="group block p-6 border-2 border-secondary-200 rounded-lg hover:shadow-md transition-all bg-white"
            >
              {/* Icon */}
              {/* <div className={`w-12 h-12 ${path.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                <path.icon className={`w-6 h-6 ${path.color}`} />
              </div> */}

             

              {/* Subtitle */}
              {/* <div className="text-sm font-medium text-secondary-500 mb-1">
                {path.subtitle}
              </div> */}

              {/* Title */}
              <h3 className="text-xl font-heading font-bold text-secondary-900 mb-3 group-hover:text-primary-600 transition-colors">
                {path.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-secondary-600 mb-4 leading-relaxed">
                {path.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-2 text-sm text-secondary-500 mb-4">
                <Users className="w-4 h-4" />
                <span>{path.students} học sinh</span>
              </div>

              {/* CTA */}
              <div className="flex items-center text-sm font-semibold text-primary-600 group-hover:text-primary-700">
                <span>Xem khóa học</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
