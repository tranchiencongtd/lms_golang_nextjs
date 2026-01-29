'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Play,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  Clock,
  BookOpen,
  Menu,
  X,
  Home,
  List,
  ArrowLeft,
  ArrowRight,
  Lock,
  CheckSquare
} from 'lucide-react'
import { getCourse, type Course as ApiCourse } from '@/lib/api/courses'
import { checkEnrollment } from '@/lib/api/enrollments'
import { getCourseProgress, markLessonCompleted, updateLastLesson, type CourseProgress } from '@/lib/api/progress'
import { useAuth } from '@/contexts/AuthContext'
import { formatDuration, getYouTubeEmbedUrl } from '@/lib/utils'

interface Lesson {
  id: string
  title: string
  duration: string
  youtubeId?: string
  isCompleted: boolean
}

interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

function minutesToDurationString(minutes: number): string {
  if (!minutes || minutes <= 0) return '0:00'
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hrs > 0 ? `${hrs}:${mins.toString().padStart(2, '0')}` : `${mins}:00`
}

export default function LearningPage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params.slug as string
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [course, setCourse] = useState<ApiCourse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)

  // Progress State
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null)
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)

  // Handle go back with fallback to course detail if no valid history
  // Handle go back with fallback to My Courses (smart back)
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer
      const currentHost = window.location.host

      // If referrer exists and is from our website, go back
      if (referrer && referrer.includes(currentHost)) {
        router.back()
      } else {
        // Otherwise, go to My Courses tab in Profile
        router.push('/tai-khoan?tab=courses')
      }
    } else {
      router.push('/tai-khoan?tab=courses')
    }
  }

  // Load course data and progress
  useEffect(() => {
    const loadCourseAndProgress = async () => {
      if (authLoading) return

      if (!isAuthenticated) {
        router.push(`/khoa-hoc/${courseSlug}`)
        return
      }

      setIsLoading(true)
      try {
        const courseData = await getCourse(courseSlug, true)
        setCourse(courseData)

        // Check enrollment
        const enrolled = await checkEnrollment(courseData.id)
        setIsEnrolled(enrolled)

        if (!enrolled) {
          router.push(`/khoa-hoc/${courseSlug}`)
          return
        }

        // Fetch progress data
        try {
          const progressData = await getCourseProgress(courseData.id)
          if (progressData?.data) {
            setCourseProgress(progressData.data)
            // Build set of completed lesson IDs
            const completedIds = new Set<string>()
            progressData.data.lesson_progress?.forEach(lp => {
              if (lp.is_completed) {
                completedIds.add(lp.lesson_id)
              }
            })
            setCompletedLessonIds(completedIds)

            // Set current lesson to last watched or first lesson
            if (progressData.data.last_lesson_id) {
              setCurrentLessonId(progressData.data.last_lesson_id)
              // Find and expand the section containing this lesson
              for (const section of courseData.sections || []) {
                const found = section.lessons?.find((l: any) => l.id === progressData.data.last_lesson_id)
                if (found) {
                  setExpandedSections([section.id])
                  break
                }
              }
            } else if (courseData.sections?.[0]?.lessons?.[0]) {
              setCurrentLessonId(courseData.sections[0].lessons[0].id)
              setExpandedSections([courseData.sections[0].id])
            }
          } else {
            // No progress yet, start from first lesson
            if (courseData.sections?.[0]?.lessons?.[0]) {
              setCurrentLessonId(courseData.sections[0].lessons[0].id)
              setExpandedSections([courseData.sections[0].id])
            }
          }
        } catch (progressErr) {
          // Progress fetch failed, start from first lesson
          console.error('Failed to load progress:', progressErr)
          if (courseData.sections?.[0]?.lessons?.[0]) {
            setCurrentLessonId(courseData.sections[0].lessons[0].id)
            setExpandedSections([courseData.sections[0].id])
          }
        }
      } catch (e: any) {
        setError(e?.message || 'Không thể tải khóa học')
      } finally {
        setIsLoading(false)
      }
    }

    loadCourseAndProgress()
  }, [courseSlug, isAuthenticated, authLoading, router])

  // Map sections for UI
  const sections: Section[] = useMemo(() => {
    if (!course?.sections) return []
    return course.sections.map(section => ({
      id: section.id,
      title: section.title,
      lessons: section.lessons?.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        duration: minutesToDurationString(lesson.duration_minutes),
        youtubeId: lesson.youtube_id,
        isCompleted: completedLessonIds.has(lesson.id),
      })) || []
    }))
  }, [course, completedLessonIds])

  // Get current lesson
  const currentLesson = useMemo(() => {
    for (const section of sections) {
      const lesson = section.lessons.find(l => l.id === currentLessonId)
      if (lesson) return { ...lesson, sectionTitle: section.title }
    }
    return null
  }, [sections, currentLessonId])

  // Get all lessons flat
  const allLessons = useMemo(() => {
    return sections.flatMap(s => s.lessons.map(l => ({ ...l, sectionId: s.id })))
  }, [sections])

  // Navigation
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const selectLesson = async (lessonId: string, sectionId: string) => {
    setCurrentLessonId(lessonId)
    if (!expandedSections.includes(sectionId)) {
      setExpandedSections(prev => [...prev, sectionId])
    }
    setMobileSidebarOpen(false)

    // Update last lesson on server
    if (course) {
      try {
        await updateLastLesson(course.id, lessonId)
      } catch (err) {
        console.error('Failed to update last lesson:', err)
      }
    }
  }

  // Handler to mark current lesson as completed
  const handleMarkComplete = useCallback(async () => {
    if (!course || !currentLessonId || isMarkingComplete) return

    if (completedLessonIds.has(currentLessonId)) {
      // Already completed
      return
    }

    setIsMarkingComplete(true)
    try {
      await markLessonCompleted(course.id, currentLessonId)
      setCompletedLessonIds(prev => new Set([...prev, currentLessonId]))

      // Update local progress count
      if (courseProgress) {
        setCourseProgress({
          ...courseProgress,
          completed_lessons: courseProgress.completed_lessons + 1,
          progress_percent: Math.round(((courseProgress.completed_lessons + 1) / courseProgress.total_lessons) * 100)
        })
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err)
    } finally {
      setIsMarkingComplete(false)
    }
  }, [course, currentLessonId, isMarkingComplete, completedLessonIds, courseProgress])

  // Calculate progress
  const totalLessons = allLessons.length
  const completedLessons = allLessons.filter(l => l.isCompleted).length
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Đang tải khóa học...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Không tìm thấy khóa học'}</p>
          <Link href="/khoa-hoc" className="text-primary-400 hover:underline">
            Quay lại danh sách khóa học
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-gray-800 border-b border-gray-700 h-14 flex items-center px-4 flex-shrink-0 z-50">
        <div className="flex items-center gap-4 flex-1">
          {/* Back to previous page */}
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden md:inline text-sm">Quay lại</span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-600" />

          {/* Course Title */}
          <h1 className="text-white font-medium text-sm md:text-base truncate max-w-[200px] md:max-w-md">
            {course.title}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Progress */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-white/60 text-xs">{progressPercent}%</span>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
          >
            <List className="w-5 h-5" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-2 text-white/80 hover:text-white transition-colors"
            title={sidebarOpen ? 'Ẩn danh sách bài học' : 'Hiện danh sách bài học'}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:mr-0' : ''}`}>
          {/* Video Player */}
          <div className="relative bg-black aspect-video w-full">
            {currentLesson?.youtubeId ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getYouTubeEmbedUrl(currentLesson.youtubeId, { autoplay: false })}
                title={currentLesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/60">
                  <Play className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p>Video không khả dụng</p>
                </div>
              </div>
            )}
          </div>

          {/* Lesson Info & Navigation */}
          <div className="bg-gray-800 border-t border-gray-700 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              {/* Current Lesson Info */}
              <div className="mb-4">
                <p className="text-primary-400 text-sm font-medium mb-1">
                  {currentLesson?.sectionTitle}
                </p>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-white text-xl md:text-2xl font-semibold">
                      {currentLesson?.title}
                    </h2>
                    <p className="text-white/50 text-sm mt-1">
                      Thời lượng: {currentLesson?.duration ? formatDuration(currentLesson.duration) : ''}
                    </p>
                  </div>
                  {/* Mark Complete Button */}
                  {currentLessonId && (
                    <button
                      onClick={handleMarkComplete}
                      disabled={isMarkingComplete || completedLessonIds.has(currentLessonId)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all flex-shrink-0 ${completedLessonIds.has(currentLessonId)
                        ? 'bg-green-600/20 text-green-400 cursor-default'
                        : isMarkingComplete
                          ? 'bg-gray-700 text-gray-400 cursor-wait'
                          : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                      {completedLessonIds.has(currentLessonId) ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span className="hidden sm:inline">Đã hoàn thành</span>
                        </>
                      ) : isMarkingComplete ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          <span className="hidden sm:inline">Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-5 h-5" />
                          <span className="hidden sm:inline">Hoàn thành bài học</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <button
                  onClick={() => prevLesson && selectLesson(prevLesson.id, prevLesson.sectionId)}
                  disabled={!prevLesson}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${prevLesson
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Bài trước</span>
                </button>

                <button
                  onClick={() => nextLesson && selectLesson(nextLesson.id, nextLesson.sectionId)}
                  disabled={!nextLesson}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${nextLesson
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                >
                  <span className="hidden sm:inline">Bài tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar - Desktop */}
        <aside
          className={`hidden lg:flex flex-col bg-gray-800 border-l border-gray-700 transition-all duration-300 ${sidebarOpen ? 'w-80 xl:w-96' : 'w-0 overflow-hidden'
            }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <h3 className="text-white font-semibold">Nội dung khóa học</h3>
            <p className="text-white/50 text-sm mt-1">
              {completedLessons}/{totalLessons} bài học hoàn thành
            </p>
          </div>

          {/* Sections List */}
          <div className="flex-1 overflow-y-auto">
            {sections.map((section, sectionIndex) => (
              <div key={section.id} className="border-b border-gray-700">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center text-white/80 text-sm font-medium">
                      {sectionIndex + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-white text-sm font-medium line-clamp-2">
                        {section.title}
                      </h4>
                      <p className="text-white/50 text-xs mt-0.5">
                        {section.lessons.length} bài học
                      </p>
                    </div>
                  </div>
                  {expandedSections.includes(section.id) ? (
                    <ChevronUp className="w-5 h-5 text-white/50 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/50 flex-shrink-0" />
                  )}
                </button>

                {/* Lessons List */}
                {expandedSections.includes(section.id) && (
                  <div className="bg-gray-900/50">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson.id, section.id)}
                        className={`w-full flex items-start gap-3 p-4 pl-6 text-left transition-colors ${currentLessonId === lesson.id
                          ? 'bg-primary-600/20 border-l-2 border-primary-500'
                          : 'hover:bg-gray-700/30 border-l-2 border-transparent'
                          }`}
                      >
                        {/* Status Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {lesson.isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : currentLessonId === lesson.id ? (
                            <Play className="w-5 h-5 text-primary-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-white/30" />
                          )}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm line-clamp-2 ${currentLessonId === lesson.id ? 'text-primary-400 font-medium' : 'text-white/80'
                            }`}>
                            {lessonIndex + 1}. {lesson.title}
                          </p>
                          <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(lesson.duration)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-gray-800 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Nội dung khóa học</h3>
                  <p className="text-white/50 text-sm">{completedLessons}/{totalLessons} hoàn thành</p>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sections */}
              <div className="flex-1 overflow-y-auto">
                {sections.map((section, sectionIndex) => (
                  <div key={section.id} className="border-b border-gray-700">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white/80 text-xs">
                          {sectionIndex + 1}
                        </span>
                        <span className="text-white text-sm font-medium line-clamp-1">
                          {section.title}
                        </span>
                      </div>
                      {expandedSections.includes(section.id) ? (
                        <ChevronUp className="w-4 h-4 text-white/50" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/50" />
                      )}
                    </button>

                    {expandedSections.includes(section.id) && (
                      <div className="bg-gray-900/50">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <button
                            key={lesson.id}
                            onClick={() => selectLesson(lesson.id, section.id)}
                            className={`w-full flex items-center gap-3 p-3 pl-5 text-left ${currentLessonId === lesson.id
                              ? 'bg-primary-600/20 border-l-2 border-primary-500'
                              : 'border-l-2 border-transparent'
                              }`}
                          >
                            {lesson.isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : currentLessonId === lesson.id ? (
                              <Play className="w-4 h-4 text-primary-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-white/30" />
                            )}
                            <span className={`text-sm line-clamp-1 ${currentLessonId === lesson.id ? 'text-primary-400' : 'text-white/70'
                              }`}>
                              {lessonIndex + 1}. {lesson.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
