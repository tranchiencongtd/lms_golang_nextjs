'use client'

import { useState } from 'react'
import { Phone, User, Users, GraduationCap, CheckCircle, Calendar, TrendingUp, Sparkles, ArrowRight, Clock, Headphones } from 'lucide-react'

export default function CTA() {
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    academicLevel: '',
    birthYear: '',
    grade: '',
    phone: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Handle form submission
    console.log('Form submitted:', formData)
    setIsSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section id="dang-ky-tu-van" className="py-12 lg:py-16 bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="text-white">
            {/* <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Tư vấn miễn phí 100%
            </span> */}
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6 leading-tight text-white">
              Đăng ký nhận tư vấn
              <br />
              <span className="text-cyan-300">lộ trình học tập</span>
            </h2>
            
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Để lại thông tin, chuyên gia của chúng tôi sẽ liên hệ tư vấn lộ trình học tập phù hợp nhất với con bạn.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Tư vấn 1-1</h4>
                  <p className="text-sm text-white/70">Với chuyên gia giáo dục</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Đánh giá năng lực</h4>
                  <p className="text-sm text-white/70">Phân tích điểm mạnh yếu</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Lộ trình cá nhân</h4>
                  <p className="text-sm text-white/70">Thiết kế riêng cho con</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Phản hồi nhanh</h4>
                  <p className="text-sm text-white/70">Trong vòng 24 giờ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-secondary-900 mb-3">
                  Đăng ký thành công!
                </h3>
                <p className="text-secondary-600 mb-6">
                  Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-[#0056D2] font-medium hover:underline"
                >
                  Đăng ký thêm
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-heading font-bold text-secondary-900 mb-2">
                    Điền thông tin để được tư vấn
                  </h3>
                  <p className="text-sm text-secondary-500">
                    Chúng tôi sẽ liên hệ trong vòng 24h
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Student Name */}
                  <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-secondary-700 mb-1.5">
                      Họ tên học sinh <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        required
                        placeholder="Nhập họ tên học sinh"
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0056D2] focus:ring-2 focus:ring-[#0056D2]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Parent Name */}
                  <div>
                    <label htmlFor="parentName" className="block text-sm font-medium text-secondary-700 mb-1.5">
                      Họ tên phụ huynh <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="parentName"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleChange}
                        required
                        placeholder="Nhập họ tên phụ huynh"
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0056D2] focus:ring-2 focus:ring-[#0056D2]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Two columns: Birth Year & Grade */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Birth Year */}
                    <div>
                      <label htmlFor="birthYear" className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Năm sinh <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          id="birthYear"
                          name="birthYear"
                          value={formData.birthYear}
                          onChange={handleChange}
                          required
                          placeholder="VD: 2010"
                          min="2000"
                          max="2020"
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0056D2] focus:ring-2 focus:ring-[#0056D2]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Grade */}
                    <div>
                      <label htmlFor="grade" className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Lớp <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          id="grade"
                          name="grade"
                          value={formData.grade}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0056D2] focus:ring-2 focus:ring-[#0056D2]/20 appearance-none bg-white transition-all"
                        >
                          <option value="">Chọn lớp</option>
                          <option value="6">Lớp 6</option>
                          <option value="7">Lớp 7</option>
                          <option value="8">Lớp 8</option>
                          <option value="9">Lớp 9</option>
                          <option value="10">Lớp 10</option>
                          <option value="11">Lớp 11</option>
                          <option value="12">Lớp 12</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Academic Level */}
                  <div>
                    <label htmlFor="academicLevel" className="block text-sm font-medium text-secondary-700 mb-1.5">
                      Lực học <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        id="academicLevel"
                        name="academicLevel"
                        value={formData.academicLevel}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0056D2] focus:ring-2 focus:ring-[#0056D2]/20 appearance-none bg-white transition-all"
                      >
                        <option value="">Chọn lực học</option>
                        <option value="yeu">Yếu (Dưới 5 điểm)</option>
                        <option value="trung-binh">Trung bình (5-6 điểm)</option>
                        <option value="kha">Khá (7-8 điểm)</option>
                        <option value="gioi">Giỏi (9-10 điểm)</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Nhập số điện thoại"
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0056D2] focus:ring-2 focus:ring-[#0056D2]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#0056D2] text-white font-semibold rounded-xl text-base hover:bg-[#004BB5] transition-colors flex items-center justify-center gap-2 group"
                  >
                    Đăng ký tư vấn ngay
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-xs text-secondary-500 text-center pt-2">
                    Bằng việc đăng ký, bạn đồng ý với{' '}
                    <a href="/dieu-khoan" className="text-[#0056D2] hover:underline">
                      Điều khoản sử dụng
                    </a>{' '}
                    của chúng tôi.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
