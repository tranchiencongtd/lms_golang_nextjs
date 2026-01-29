'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { formatPrice, formatDuration, getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/utils'
import { getCourse, type Course as ApiCourse } from '@/lib/api/courses'
import { checkEnrollment } from '@/lib/api/enrollments'
import { useAuth } from '@/contexts/AuthContext'
import {
  Star,
  Clock,
  BookOpen,
  Users,
  Play,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Award,
  FileText,
  Download,
  Globe,
  Shield,
  ArrowLeft,
  X
} from 'lucide-react'

function minutesToDurationString(minutes: number): string {
  if (!minutes || minutes <= 0) return '0:00'
  return `${minutes}:00`
}

function mapApiCourseToUi(course: ApiCourse) {
  const curriculum =
    course.sections?.map((section) => ({
      title: section.title,
      lessons:
        section.lessons?.map((lesson) => ({
          title: lesson.title,
          duration: minutesToDurationString(lesson.duration_minutes),
          preview: !!lesson.is_preview,
          youtubeId: lesson.youtube_id,
        })) ?? [],
    })) ?? []

  // Parse semicolon-separated strings into arrays
  const parseList = (str?: string, fallback: string[] = []): string[] => {
    if (!str || str.trim() === '') return fallback
    return str.split('\n').map(item => item.trim()).filter(item => item.length > 0)
  }

  const defaultWhatYouLearn = [
    'Nắm vững kiến thức trọng tâm theo lộ trình',
    'Giải thành thạo các dạng bài tập thường gặp',
    'Tăng tốc độ và độ chính xác khi làm bài',
    'Tự tin ôn tập và kiểm tra',
  ]

  const defaultRequirements = [
    'Thiết bị có kết nối Internet',
    'Tinh thần học tập nghiêm túc và kiên trì',
  ]

  return {
    id: course.id,
    title: course.title,
    instructor: course.instructor?.full_name || 'Giảng viên MathVN',
    instructorTitle: 'Giảng viên',
    instructorAvatar: course.instructor?.avatar || '',
    rating: course.rating || 0,
    students: course.total_students || 0,
    reviews: course.total_reviews || 0,
    lessons: course.total_lessons || 0,
    duration: formatDuration(minutesToDurationString(course.duration_minutes || 0)),
    price: course.price || 0,
    originalPrice: course.original_price ?? course.price ?? 0,
    language: course.language || 'Tiếng Việt',
    description: course.description || course.short_description || '',
    whatYouLearn: parseList(course.what_you_learn, defaultWhatYouLearn),
    requirements: parseList(course.requirements, defaultRequirements),
    curriculum,
    level: course.level === 'advanced' ? 'Nâng cao' : 'Cơ bản',
    lastUpdated: course.updated_at ? new Date(course.updated_at).toLocaleDateString('vi-VN') : '',
  }
}

export default function CourseDetailPage() {
  const params = useParams()
  const courseIdOrSlug = params.id as string
  const { isAuthenticated } = useAuth()

  const [apiCourse, setApiCourse] = useState<ApiCourse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getCourse(courseIdOrSlug, true)
        setApiCourse(res)

        // Check enrollment status if authenticated
        if (isAuthenticated && res.id) {
          try {
            const enrolled = await checkEnrollment(res.id)
            setIsEnrolled(enrolled)
          } catch {
            // Ignore enrollment check errors
            setIsEnrolled(false)
          }
        }
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'Không thể tải khóa học'
        setError(msg)
        setApiCourse(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [courseIdOrSlug, isAuthenticated])

  const course = useMemo(() => (apiCourse ? mapApiCourseToUi(apiCourse) : null), [apiCourse])

  const [expandedSections, setExpandedSections] = useState<number[]>([0])
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [currentPreviewLesson, setCurrentPreviewLesson] = useState<{ title: string; duration: string; chapterTitle: string; youtubeId?: string } | null>(null)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 animate-pulse">
          {/* Breadcrumb skeleton */}
          {/* <div className="h-6 w-48 bg-gray-200 rounded" /> */}

          <div className="lg:flex lg:gap-12">
            {/* Left column */}
            <div className="lg:flex-1 space-y-6">
              <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-100 space-y-4">
                <div className="h-6 w-2/3 bg-gray-200 rounded" />
                <div className="h-8 w-2/3 bg-gray-200 rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-28 bg-gray-200 rounded" />
                  <div className="h-10 w-36 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="grid sm:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 w-full bg-gray-200 rounded" />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
                <div className="h-6 w-32 bg-gray-200 rounded" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 w-5/6 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-40 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, sectionIdx) => (
                    <div key={sectionIdx} className="border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div className="h-4 w-40 bg-gray-200 rounded" />
                        <div className="h-4 w-12 bg-gray-200 rounded" />
                      </div>
                      <div className="divide-y divide-gray-100">
                        {[...Array(2)].map((__, lessonIdx) => (
                          <div key={lessonIdx} className="p-4 flex items-center justify-between">
                            <div className="h-4 w-56 bg-gray-200 rounded" />
                            <div className="h-4 w-10 bg-gray-200 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column (sidebar) */}
            <aside className="lg:w-96 space-y-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="h-52 w-full bg-gray-200 rounded-lg" />
                <div className="h-6 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="space-y-2">
                  <div className="h-10 w-full bg-gray-200 rounded" />
                  <div className="h-10 w-full bg-gray-200 rounded" />
                </div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 w-full bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-3">Không tìm thấy khóa học</h1>
          <p className="text-secondary-600 mb-6">
            {'Khóa học không tồn tại hoặc đã bị gỡ.'}
          </p>
          <Link href="/khoa-hoc" className="text-primary-600 hover:underline">
            Quay lại danh sách khóa học
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  // Get all preview lessons
  const previewLessons = course.curriculum.flatMap((section) =>
    section.lessons
      .filter(lesson => lesson.preview)
      .map(lesson => ({ ...lesson, chapterTitle: section.title }))
  )

  const openPreviewModal = (lesson?: { title: string; duration: string; chapterTitle: string; youtubeId?: string }) => {
    setCurrentPreviewLesson(lesson || previewLessons[0] || null)
    setShowPreviewModal(true)
  }

  const toggleSection = (index: number) => {
    setExpandedSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const totalLessons = course.curriculum.reduce((acc, section) => acc + section.lessons.length, 0)
  const discount = Math.round((1 - course.price / course.originalPrice) * 100)

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Preview Video Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop - Dark blur */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowPreviewModal(false)}
          />

          {/* Modal Content - White background */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex flex-col lg:flex-row">
              {/* Video Player - YouTube Embed */}
              <div className="flex-1 flex flex-col bg-gray-900">
                <div className="aspect-video bg-black">
                  {currentPreviewLesson?.youtubeId ? (
                    <iframe
                      className="w-full h-full"
                      src={getYouTubeEmbedUrl(currentPreviewLesson.youtubeId, { autoplay: true })}
                      title={currentPreviewLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-white/60">
                        <Play className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p>Video không khả dụng</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Current Lesson Info */}
                <div className="p-5 bg-gray-50 border-t border-gray-200">
                  <p className="text-primary-600 text-sm font-medium mb-1">
                    {currentPreviewLesson?.chapterTitle}
                  </p>
                  <h4 className="text-secondary-900 text-lg font-semibold">
                    {currentPreviewLesson?.title}
                  </h4>
                  <p className="text-secondary-500 text-sm mt-1">
                    Thời lượng: {currentPreviewLesson?.duration ? formatDuration(currentPreviewLesson.duration) : ''}
                  </p>
                </div>
              </div>

              {/* Preview Lessons List */}
              <div className="lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                  <h3 className="text-secondary-900 font-semibold">Nội dung xem trước</h3>
                  <p className="text-secondary-500 text-sm mt-0.5">{previewLessons.length} video miễn phí</p>
                </div>
                <div className="flex-1 overflow-y-auto max-h-64 lg:max-h-[350px]">
                  {previewLessons.length > 0 ? (
                    previewLessons.map((lesson, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPreviewLesson(lesson)}
                        className={`w-full text-left p-4 border-b border-gray-100 hover:bg-primary-50 transition-colors ${currentPreviewLesson?.title === lesson.title ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'bg-white'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${currentPreviewLesson?.title === lesson.title
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 text-secondary-500'
                            }`}>
                            <Play className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm line-clamp-2 ${currentPreviewLesson?.title === lesson.title
                              ? 'text-primary-700 font-medium'
                              : 'text-secondary-700'
                              }`}>
                              {lesson.title}
                            </p>
                            <p className="text-secondary-400 text-xs mt-1">{formatDuration(lesson.duration)}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-secondary-400 text-sm">
                      Không có video xem trước
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-secondary-900">{formatPrice(course.price)}</span>
                    <span className="text-sm text-secondary-400 line-through">{formatPrice(course.originalPrice)}</span>
                    <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">
                      -{discount}%
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="w-full btn-primary py-3 font-semibold"
                  >
                    Đăng ký khóa học
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/khoa-hoc" className="text-primary-600 hover:underline flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Khóa học
            </Link>
            <span className="text-secondary-400">/</span>
            <span className="text-secondary-600 line-clamp-1">{course.title}</span>
          </div>
        </div>
      </div>

      {/* Course Header + Content */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="lg:flex lg:gap-12">
            {/* Left: Course Info + Content */}
            <div className="lg:flex-1 space-y-8">
              {/* Course Header */}
              <div className="bg-white rounded-xl p-6 lg:p-8 ">
                {/* Badge & Level */}
                {/* <div className="flex items-center gap-2 mb-4">
                {course.badge && (
                  <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${course.badgeColor}`}>
                    {course.badge}
                  </span>
                )}
                <span className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-full">
                  {course.level}
                </span>
              </div> */}

                {/* Title */}
                <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-4 leading-tight">
                  {course.title}
                </h1>

                {/* Description */}
                <p className="text-secondary-600 mb-6 leading-relaxed">
                  {course.description}
                </p>

                {/* Rating & Stats */}
                <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 ">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= Math.floor(course.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-secondary-900">{course.rating}</span>
                    <span className="text-secondary-500">({course.reviews.toLocaleString()} đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-secondary-600">
                    <Users className="w-4 h-4 text-primary-500" />
                    <span>{course.students.toLocaleString()} học sinh đã đăng ký</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-md">
                    {course.instructor.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-900">{course.instructor}</p>
                    <p className="text-sm text-secondary-500">{course.instructorTitle}</p>
                  </div>
                </div>

                {/* Meta Tags */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-secondary-600">
                    <Clock className="w-4 h-4 text-primary-500" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-secondary-600">
                    <BookOpen className="w-4 h-4 text-primary-500" />
                    <span>{course.lessons} bài học</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-secondary-600">
                    <Globe className="w-4 h-4 text-primary-500" />
                    <span>{course.language}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-secondary-600">
                    <FileText className="w-4 h-4 text-primary-500" />
                    <span>Cập nhật: {course.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* What You'll Learn */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Bạn sẽ học được gì</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.whatYouLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-secondary-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Yêu cầu</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-secondary-700">
                      <span className="w-1.5 h-1.5 bg-secondary-400 rounded-full mt-2 flex-shrink-0"></span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curriculum */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-secondary-900">Nội dung khóa học</h2>
                  <p className="text-sm text-secondary-500">
                    {course.curriculum.length} chương • {totalLessons} bài học • {course.duration}
                  </p>
                </div>

                <div className="space-y-3">
                  {course.curriculum.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(sectionIndex)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedSections.includes(sectionIndex) ? (
                            <ChevronUp className="w-5 h-5 text-secondary-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-secondary-500" />
                          )}
                          <span className="font-medium text-secondary-900">{section.title}</span>
                        </div>
                        <span className="text-sm text-secondary-500">{section.lessons.length} bài</span>
                      </button>

                      {/* Section Content */}
                      {expandedSections.includes(sectionIndex) && (
                        <div className="divide-y divide-gray-100">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-3">
                                <Play className="w-4 h-4 text-secondary-400" />
                                <span className="text-sm text-secondary-700">{lesson.title}</span>
                                {lesson.preview && (
                                  <button
                                    onClick={() => openPreviewModal({
                                      title: lesson.title,
                                      duration: lesson.duration,
                                      chapterTitle: section.title,
                                      youtubeId: lesson.youtubeId
                                    })}
                                    className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded hover:bg-primary-100 transition-colors cursor-pointer"
                                  >
                                    Xem trước
                                  </button>
                                )}
                              </div>
                              <span className="text-sm text-secondary-500">{formatDuration(lesson.duration)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Giảng viên</h2>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {course.instructor.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900 text-lg">{course.instructor}</h3>
                    <p className="text-secondary-500 mb-3">{course.instructorTitle}</p>
                    <div className="flex items-center gap-4 text-sm text-secondary-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{course.rating} đánh giá</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-secondary-400" />
                        <span>{course.students.toLocaleString()} học sinh</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-secondary-400" />
                        <span>5 khóa học</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Sticky Price Card */}
            <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
              <div className="sticky top-20">
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                  {/* Thumbnail - YouTube Preview */}
                  <div
                    onClick={() => openPreviewModal()}
                    className="cursor-pointer relative aspect-video rounded-lg mb-5 flex items-center justify-center overflow-hidden group"
                  >
                    {previewLessons[0]?.youtubeId ? (
                      <img
                        src={getYouTubeThumbnail(previewLessons[0].youtubeId, 'hq')}
                        alt="Video preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200" />
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all z-10">
                      <Play className="w-7 h-7 text-primary-600 ml-1" />
                    </div>
                    <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                      Xem trước
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-secondary-900">{formatPrice(course.price)}</span>
                    <span className="text-lg text-secondary-400 line-through">{formatPrice(course.originalPrice)}</span>
                  </div>
                  <div className="mb-5">
                    <span className="inline-block px-2 py-0.5 bg-red-50 text-red-600 text-sm font-medium rounded">
                      Tiết kiệm {discount}%
                    </span>
                  </div>

                  {/* CTA Button */}
                  {isEnrolled ? (
                    <Link
                      href={`/hoc/${apiCourse?.slug || courseIdOrSlug}`}
                      className="w-full btn-primary py-3.5 text-base font-semibold shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                    >
                      {/* <Play className="w-5 h-5" /> */}
                      Vào học ngay
                    </Link>
                  ) : (
                    <button className="w-full btn-primary py-3.5 text-base font-semibold shadow-md hover:shadow-lg transition-shadow">
                      Liên hệ ngay
                    </button>
                  )}

                  {/* Features */}
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                    <p className="text-sm font-medium text-secondary-900 mb-3">Khóa học bao gồm:</p>
                    <div className="flex items-center gap-2.5 text-sm text-secondary-600">
                      <Clock className="w-4 h-4 text-primary-500" />
                      <span>{course.duration} video bài giảng</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-secondary-600">
                      <BookOpen className="w-4 h-4 text-primary-500" />
                      <span>{course.lessons} bài học chi tiết</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-secondary-600">
                      <Download className="w-4 h-4 text-primary-500" />
                      <span>Tài liệu & bài tập đi kèm</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-secondary-600">
                      <Shield className="w-4 h-4 text-primary-500" />
                      <span>Truy cập mọi thiết bị</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Price Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-secondary-900">{formatPrice(course.price)}</span>
              <span className="text-sm text-secondary-400 line-through">{formatPrice(course.originalPrice)}</span>
            </div>
            <span className="text-xs text-red-600 font-medium">Giảm {discount}%</span>
          </div>
          {isEnrolled ? (
            <Link
              href={`/hoc/${apiCourse?.slug || courseIdOrSlug}`}
              className="btn-primary py-3 px-6 font-semibold flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Vào học
            </Link>
          ) : (
            <button className="btn-primary py-3 px-6 font-semibold">
              Liên hệ ngay
            </button>
          )}
        </div>
      </div>

      {/* Add padding for mobile fixed bar */}
      <div className="lg:hidden h-24"></div>

      <Footer />
    </main>
  )
}
