'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  BookOpen,
  Lock,
  Mail,
  Phone,
  Shield,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  GraduationCap,
  Save,
  Eye,
  EyeOff,
  Camera,
  Calendar,
  ArrowRight
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { getMyEnrolledCourses, Enrollment } from '@/lib/api/enrollments'
import { updateProfile, changePassword } from '@/lib/api/auth'
import { formatDate, formatDuration } from '@/lib/utils'

type TabType = 'profile' | 'courses' | 'password'

interface TabItem {
  id: TabType
  label: string
  icon: React.ReactNode
}

const tabs: TabItem[] = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: <User className="w-5 h-5" /> },
  { id: 'courses', label: 'Khoá học của tôi', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'password', label: 'Đổi mật khẩu', icon: <Lock className="w-5 h-5" /> },
]

// Role display mapping
const roleLabels: Record<string, { label: string; color: string }> = {
  student: { label: 'Học sinh', color: 'bg-blue-100 text-blue-700' },
  teacher: { label: 'Giáo viên', color: 'bg-green-100 text-green-700' },
  admin: { label: 'Quản trị viên', color: 'bg-purple-100 text-purple-700' },
}

export default function AccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading, isAuthenticated, refreshUser } = useAuth()

  const [activeTab, setActiveTab] = useState<TabType>('profile')

  // Handle tab from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['profile', 'courses', 'password'].includes(tabParam)) {
      setActiveTab(tabParam as TabType)
    }
  }, [searchParams])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false)
  const [enrollmentsError, setEnrollmentsError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [authLoading, isAuthenticated, router])

  // Load enrolled courses when tab changes
  useEffect(() => {
    if (activeTab === 'courses' && isAuthenticated) {
      loadEnrollments()
    }
  }, [activeTab, isAuthenticated])

  const loadEnrollments = async () => {
    setEnrollmentsLoading(true)
    setEnrollmentsError(null)
    try {
      const data = await getMyEnrolledCourses()
      setEnrollments(data.enrollments || [])
    } catch (error: any) {
      console.error('Failed to load enrollments:', error)
      setEnrollmentsError(error.message || 'Không thể tải danh sách khoá học')
    } finally {
      setEnrollmentsLoading(false)
    }
  }

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Loading state - Skeleton
  if (authLoading) {
    const tabParam = searchParams.get('tab')
    const isCoursesTab = tabParam === 'courses'

    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Skeleton */}
              <aside className="lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-4 border-b border-secondary-100 last:border-b-0">
                      <div className="w-5 h-5 bg-secondary-200 rounded animate-pulse" />
                      <div className="h-4 bg-secondary-200 rounded w-32 animate-pulse" />
                    </div>
                  ))}
                </div>
              </aside>

              {/* Content Skeleton */}
              <div className="flex-1 min-w-0 space-y-6">
                {/* Header Skeleton */}
                <div>
                  <div className="h-8 bg-secondary-200 rounded w-48 animate-pulse mb-2" />
                  <div className="h-4 bg-secondary-200 rounded w-64 animate-pulse" />
                </div>

                {isCoursesTab ? (
                  // Courses Skeleton
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden h-full flex flex-col">
                        <div className="aspect-video bg-secondary-200 animate-pulse" />
                        <div className="p-4 space-y-3 flex-1">
                          <div className="h-5 bg-secondary-200 rounded w-3/4 animate-pulse" />
                          <div className="h-4 bg-secondary-200 rounded w-1/2 animate-pulse" />
                          <div className="mt-auto pt-4 space-y-2">
                            <div className="h-4 bg-secondary-200 rounded w-full animate-pulse" />
                            <div className="h-10 bg-secondary-200 rounded w-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Profile Skeleton
                  <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden">
                    {/* Avatar Section */}
                    <div className="p-6 border-b border-secondary-100 bg-secondary-50">
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-secondary-300 rounded-full animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-5 bg-secondary-200 rounded w-24 animate-pulse" />
                          <div className="h-4 bg-secondary-200 rounded w-48 animate-pulse" />
                          <div className="h-4 bg-secondary-200 rounded w-20 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Form Fields Skeleton */}
                    <div className="p-6 space-y-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i}>
                          <div className="h-4 bg-secondary-200 rounded w-24 mb-2 animate-pulse" />
                          <div className="h-12 bg-secondary-100 rounded-lg animate-pulse" />
                        </div>
                      ))}
                    </div>

                    {/* Footer Skeleton */}
                    <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-100 flex justify-end">
                      <div className="h-10 bg-secondary-200 rounded-lg w-32 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Not authenticated - show nothing while redirecting
  if (!isAuthenticated || !user) {
    return null
  }

  const roleInfo = roleLabels[user.role] || roleLabels.student

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-secondary-50">


        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden lg:sticky lg:top-24">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      router.push(`/tai-khoan?tab=${tab.id}`, { scroll: false })
                    }}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-all ${activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500 font-medium'
                      : 'text-secondary-600 hover:bg-secondary-50 border-l-4 border-transparent'
                      }`}
                  >
                    <span className={activeTab === tab.id ? 'text-primary-500' : 'text-secondary-400'}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content Area */}
            <main className="flex-1 min-w-0">
              {activeTab === 'profile' && (
                <ProfileTab user={user} onProfileUpdate={refreshUser} />
              )}
              {activeTab === 'courses' && (
                <CoursesTab
                  enrollments={enrollments}
                  loading={enrollmentsLoading}
                  error={enrollmentsError}
                  onRetry={loadEnrollments}
                />
              )}
              {activeTab === 'password' && (
                <PasswordTab />
              )}
            </main>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// ============ Profile Tab with Edit ============
interface ProfileTabProps {
  user: {
    full_name: string
    email: string
    phone_number: string
    role: string
    is_verified: boolean
    avatar?: string
  }
  onProfileUpdate: () => Promise<void>
}

function ProfileTab({ user, onProfileUpdate }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    email: user.email,
    phone_number: user.phone_number || '',
  })
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const roleInfo = roleLabels[user.role] || roleLabels.student

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setIsEditing(true)
    setSaveSuccess(false)
    setSaveError(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      await updateProfile({
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
      })
      await onProfileUpdate() // Refresh user data in context
      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error: any) {
      console.error('Failed to save profile:', error)
      setSaveError(error.response?.data?.message || error.message || 'Không thể cập nhật thông tin')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-secondary-900">Thông tin cá nhân</h2>
        <p className="text-secondary-500 mt-1">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden">
        {/* Avatar Section */}
        <div className="p-6 border-b border-secondary-100 bg-secondary-50">
          <div className="flex items-center gap-6">
            <div className="relative group">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.full_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {user.full_name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              )}
              <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">Ảnh đại diện</h3>
              <p className="text-sm text-secondary-500 mt-1">
                JPG, PNG hoặc GIF. Tối đa 2MB.
              </p>
              <button className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                Thay đổi ảnh
              </button>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-6 space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-secondary-700 mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Nhập họ và tên"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-28 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Nhập email"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {user.is_verified ? (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Đã xác minh
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    <XCircle className="w-3 h-3" />
                    Chưa xác minh
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-secondary-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Nhập số điện thoại"
            />
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Vai trò
            </label>
            <div className="flex items-center gap-3 px-4 py-3 border border-secondary-200 rounded-lg bg-secondary-50">
              <Shield className="w-5 h-5 text-secondary-400" />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-100 flex items-center justify-between">
          <div>
            {saveSuccess && (
              <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Đã lưu thành công!
              </span>
            )}
            {saveError && (
              <span className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                {saveError}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isEditing && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-secondary-600 hover:text-secondary-800 font-medium transition-colors"
              >
                Huỷ
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!isEditing || isSaving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${isEditing
                ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg'
                : 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
                }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ Courses Tab ============
interface CoursesTabProps {
  enrollments: Enrollment[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

function CoursesTab({ enrollments, loading, error, onRetry }: CoursesTabProps) {
  // Loading state - Skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Khoá học của tôi</h2>
          <p className="text-secondary-500 mt-1">Danh sách các khoá học bạn đã đăng ký</p>
        </div>
        {/* Course Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden">
              {/* Image Skeleton */}
              <div className="aspect-video bg-secondary-200 animate-pulse" />

              {/* Content Skeleton */}
              <div className="p-5 space-y-4">
                {/* Title */}
                <div className="h-6 bg-secondary-200 rounded animate-pulse" />
                <div className="h-4 bg-secondary-200 rounded w-3/4 animate-pulse" />

                {/* Instructor */}
                <div className="h-4 bg-secondary-100 rounded w-1/2 animate-pulse" />

                {/* Meta */}
                <div className="flex gap-4">
                  <div className="h-4 bg-secondary-100 rounded w-24 animate-pulse" />
                  <div className="h-4 bg-secondary-100 rounded w-24 animate-pulse" />
                </div>

                {/* Button */}
                <div className="h-12 bg-secondary-200 rounded-lg animate-pulse mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Khoá học của tôi</h2>
          <p className="text-secondary-500 mt-1">Danh sách các khoá học bạn đã đăng ký</p>
        </div>
        <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-secondary-100">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-secondary-900">{error}</p>
              <p className="text-secondary-500 text-sm mt-1">Vui lòng thử lại sau</p>
            </div>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (enrollments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Khoá học của tôi</h2>
          <p className="text-secondary-500 mt-1">Danh sách các khoá học bạn đã đăng ký</p>
        </div>
        <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-secondary-100">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-primary-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-secondary-900">Chưa có khoá học nào</h3>
              <p className="text-secondary-500 mt-2">
                Bạn chưa đăng ký khoá học nào. Hãy khám phá các khoá học và sử dụng mã kích hoạt để bắt đầu học!
              </p>
            </div>
            <Link
              href="/khoa-hoc"
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Khám phá khoá học
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Khoá học của tôi</h2>
          <p className="text-secondary-500 mt-1">
            Bạn đang học {enrollments.length} khoá học
          </p>
        </div>
        <Link
          href="/khoa-hoc"
          className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium"
        >
          Xem thêm khoá học
        </Link>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => (
          <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
        ))}
      </div>
    </div>
  )
}

// ============ Enrollment Card ============
interface EnrollmentCardProps {
  enrollment: Enrollment
}

function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
  const course = enrollment.course

  if (!course) {
    return null
  }

  const statusColors = {
    active: 'bg-primary-600/90 text-white shadow-sm backdrop-blur-sm',
    expired: 'bg-red-500/90 text-white shadow-sm backdrop-blur-sm',
    cancelled: 'bg-secondary-500/90 text-white shadow-sm backdrop-blur-sm',
  }

  const statusLabels = {
    active: 'Đang học',
    expired: 'Đã hết hạn',
    cancelled: 'Đã huỷ',
  }

  const isExpiringSoon = enrollment.expires_at &&
    new Date(enrollment.expires_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden hover:shadow-card-hover transition-all duration-300 group flex flex-col h-full">
      {/* Course Image */}
      <div className="relative aspect-video bg-secondary-100 overflow-hidden">
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary-100">
            <BookOpen className="w-12 h-12 text-secondary-300" />
          </div>
        )}

        {/* Overlay Gradient */}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[enrollment.status]}`}>
            {statusLabels[enrollment.status]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">

        {/* Title */}
        <h3 className="font-heading font-bold text-base text-secondary-900 line-clamp-2 mb-3 h-12 group-hover:text-primary-600 transition-colors" title={course.title}>
          {course.title}
        </h3>

        {/* Author */}
        {course.instructor && (
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs text-secondary-600 truncate">
              {course.instructor.full_name}
            </p>
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-secondary-500 mb-2">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{course.total_lessons || 0} bài học · {formatDuration(course.duration_minutes || 0)}</span>
          </div>
        </div>


        {/* Dates Info */}
        <div className="mt-auto space-y-3">
          <div className="pt-3 border-t border-secondary-100 flex flex-col gap-3">
            {/* Registered Date */}
            <div className="flex items-start gap-2 text-xs text-secondary-600">
              <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex flex-row">
                <span className="text-secondary-500">Ngày đăng ký: {formatDate(enrollment.enrolled_at)}</span>

              </div>
            </div>

            {/* Expiry Date */}
            {enrollment.expires_at ? (
              <div className={`flex items-start gap-2 text-xs ${isExpiringSoon ? 'text-red-600 font-medium' : 'text-secondary-600'}`}>
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className={isExpiringSoon ? 'text-red-500' : 'text-secondary-500'}>Hết hạn: {formatDate(enrollment.expires_at)}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Truy cập trọn đời</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Link
            href={`/khoa-hoc/${course.slug}`}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${enrollment.status === 'active'
              ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow'
              : 'bg-secondary-100 text-secondary-500 cursor-not-allowed'
              }`}
            onClick={(e) => enrollment.status !== 'active' && e.preventDefault()}
          >
            {enrollment.status === 'active' ? (
              <>
                Vào học
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              'Không khả dụng'
            )}
          </Link>
        </div>
      </div>
    </div>
  )
}

// ============ Password Tab ============
function PasswordTab() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(false)
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (formData.newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setIsSaving(true)
    try {
      await changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      })
      setSuccess(true)
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể đổi mật khẩu')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-secondary-900">Đổi mật khẩu</h2>
        <p className="text-secondary-500 mt-1">Bảo mật tài khoản của bạn bằng mật khẩu mạnh</p>
      </div>

      {/* Password Form */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-100 rounded-lg text-green-600">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Mật khẩu đã được thay đổi thành công!</span>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-secondary-700 mb-2">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-secondary-700 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-secondary-400">
              Mật khẩu phải có ít nhất 8 ký tự
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Đổi mật khẩu
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
