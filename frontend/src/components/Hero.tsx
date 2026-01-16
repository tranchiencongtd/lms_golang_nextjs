import Link from 'next/link'
import { Search, ArrowRight, CheckCircle } from 'lucide-react'

const partners = [
  { name: 'ĐH Bách Khoa', logo: '/images/bachkhoa.png' },
  { name: 'ĐH Sư Phạm', logo: '/images/supham.png' },
  { name: 'ĐH Quốc Gia', logo: '/images/quocgia.png' },
  { name: 'Vinschool', logo: '/images/vinschool.png' },
]

const highlights = [
  'Học cùng đội ngũ giáo viên giỏi, giàu kinh nghiệm',
  'Bài tập thực hành phong phú với đáp án chi tiết',
  'Hỗ trợ học tập 24/7 qua nền tảng trực tuyến',
]

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Heading */}
            <h1 className="text-lg sm:text-5xl lg:text-5xl font-heading font-bold leading-tight text-white">
              Học Toán Online 
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-sm sm:text-lg text-primary-100 max-w-lg">
              Nền tảng học toán trực tuyến hàng đầu với hơn 500+ khóa học 
              từ lớp 6-12, luyện thi THPT Quốc Gia và toán cao cấp.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a href="#dang-ky-tu-van" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors cursor-pointer">
                Đăng ký tư vấn
              </a>
              <Link href="/khoa-hoc" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white text-white font-semibold hover:bg-white/10 transition-colors cursor-pointer">
                Xem khóa học
              </Link>
            </div>

            {/* Highlights */}
            <div className="mt-10 space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-accent-green flex-shrink-0" />
                  <span className="text-sm text-primary-100">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Search Card */}
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <h2 className="text-3xl font-heading font-semibold text-secondary-900 mb-2">
              Bạn muốn học gì?
            </h2>
            <p className="text-base text-secondary-600 mb-6">
              Tìm khóa học phù hợp với trình độ và mục tiêu của bạn
            </p>

            {/* Search Box */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Tìm khóa học, chủ đề..."
                className="w-full pl-12 pr-4 py-4 bg-secondary-50 border border-secondary-200 text-secondary-700 placeholder-secondary-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            {/* Popular Searches */}
            <div className="mb-6">
              <p className="text-sm text-secondary-500 mb-3">Chủ đề phổ biến:</p>
              <div className="flex flex-wrap gap-2">
                {['Đại số', 'Hình học',].map((topic) => (
                  <Link 
                    key={topic}
                    href={`/tim-kiem?q=${topic}`}
                    className="px-3 py-1.5 bg-secondary-100 text-secondary-700 text-sm hover:bg-secondary-200 transition-colors cursor-pointer"
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            </div>

            {/* Explore Button */}
            <Link 
              href="/khoa-hoc"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors cursor-pointer"
            >
              Khám phá tất cả khóa học
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Partner Logos */}
      <div className="bg-white border-t border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-secondary-500 mb-6">
            Được tin dùng bởi <span className="text-primary-500 font-semibold">50,000+ học sinh và phụ huynh</span> trên toàn quốc
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="text-secondary-600 font-medium">Đối tác giáo dục:</div>
            <div className="text-secondary-500">ĐH Bách Khoa Hà Nội</div>
            <div className="text-secondary-500">ĐH Sư Phạm TP.HCM</div>
            <div className="text-secondary-500">Hệ thống Vinschool</div>
          </div>
        </div>
      </div>
    </section>
  )
}
