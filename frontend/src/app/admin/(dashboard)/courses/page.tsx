'use client'

import { useState, useEffect } from 'react'
import { Search, Edit2, Plus, BookOpen, Trash2, AlertTriangle, BarChart, DollarSign, Filter, FileText, Image, Video, CheckSquare, Layers, ChevronDown } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import Pagination from '@/components/admin/Pagination'
import Modal from '@/components/admin/Modal'
import Toast, { ToastType } from '@/components/admin/Toast'
import { adminCoursesApi, Course, CreateCourseInput } from '@/lib/api/admin/courses'
import { formatPrice, getYouTubeId, getYouTubeThumbnail } from '@/lib/utils'
import CurriculumEditor from '@/components/admin/CurriculumEditor'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [levelFilter, setLevelFilter] = useState<string>('')

  // Create/Edit State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form Data
  const initialForm: CreateCourseInput = {
    title: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    original_price: 0,
    image_url: '',
    video_preview_url: '',
    level: 'basic',
    grade: '',
    what_you_learn: '',
    requirements: '',
    status: 'draft',
    is_featured: false
  }

  const [formData, setFormData] = useState<CreateCourseInput>(initialForm)

  // Tabs state
  const [activeTab, setActiveTab] = useState<'basic' | 'curriculum'>('basic')

  // Toast
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const showToast = (message: string, type: ToastType) => setToast({ message, type })

  // Helper to handle video URL change
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFormData(prev => {
      let newData = { ...prev, video_preview_url: url }
      const videoId = getYouTubeId(url)

      if (videoId) {
        const currentImage = prev.image_url || ''
        // Update if image is empty OR if the current image is a YouTube thumbnail
        // This allows users to keep custom uploaded images if they have one
        if (!currentImage || currentImage.includes('img.youtube.com')) {
          newData.image_url = getYouTubeThumbnail(videoId, 'hq')
        }
      }
      return newData
    })
  }

  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      const data = await adminCoursesApi.list({
        page,
        page_size: limit,
        search,
        status: statusFilter || undefined,
        level: levelFilter || undefined
      })

      if (data && data.items) {
        setCourses(data.items)
        setTotal(data.pagination.total)
      } else {
        setCourses([])
        setTotal(0)
      }

    } catch (err: any) {
      console.error(err)
      showToast('Không thể tải danh sách khóa học', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [page, search, statusFilter, levelFilter])

  // Handlers
  const handleCreate = async () => {
    // Validate
    if (!formData.title || !formData.short_description) {
      showToast('Vui lòng nhập tên và mô tả ngắn', 'error')
      return
    }

    setIsSaving(true)
    try {
      await adminCoursesApi.create(formData)
      setIsCreateModalOpen(false)
      setFormData(initialForm)
      fetchCourses()
      showToast('Tạo khóa học thành công', 'success')
    } catch (err) {
      console.error(err)
      showToast('Lỗi khi tạo khóa học', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingCourse) return
    setIsSaving(true)
    try {
      await adminCoursesApi.update(editingCourse.id, formData as any)
      setEditingCourse(null)
      fetchCourses()
      showToast('Cập nhật khóa học thành công', 'success')
    } catch (err) {
      showToast('Lỗi khi cập nhật khóa học', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteCourse) return
    setIsSaving(true)
    try {
      await adminCoursesApi.delete(deleteCourse.id)
      setDeleteCourse(null)
      fetchCourses()
      showToast('Đã xóa khóa học thành công', 'success')
    } catch (err) {
      showToast('Lỗi khi xóa khóa học', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const openCreateModal = () => {
    setFormData(initialForm)
    setIsCreateModalOpen(true)
  }

  const openEditModal = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      short_description: course.short_description || '',
      price: course.price || 0,
      original_price: course.original_price || 0,
      image_url: course.image_url || '',
      video_preview_url: course.video_preview_url || '',
      level: course.level,
      grade: course.grade || '',
      what_you_learn: course.what_you_learn || '',
      requirements: course.requirements || '',
      status: course.status,
      is_featured: course.is_featured,
      rating: course.rating || 0,
      total_reviews: course.total_reviews || 0,
      total_students: course.total_students || 0,
      duration_minutes: course.duration_minutes || 0,
      total_lessons: course.total_lessons || 0
    })
    setActiveTab('basic')
    setIsCreateModalOpen(true)
  }

  // Columns
  const columns: Column<Course>[] = [
    {
      key: 'title',
      label: 'KHÓA HỌC',
      render: (c) => (
        <div>
          <div className="font-medium text-gray-900 line-clamp-1" title={c.title}>{c.title}</div>
          <div className="text-sm text-gray-500 line-clamp-1">{c.slug}</div>
          {c.is_featured && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200 mt-1 inline-block">Nổi bật</span>}
        </div>
      )
    },
    {
      key: 'price',
      label: 'HỌC PHÍ',
      render: (c) => (
        <div>
          <div className="font-medium text-gray-700">{formatPrice(c.price)}</div>
          {c.original_price ? <div className="text-xs text-gray-400 line-through">{formatPrice(c.original_price)}</div> : null}
        </div>
      )
    },
    {
      key: 'level',
      label: 'TRÌNH ĐỘ',
      render: (c) => {
        const map: Record<string, string> = { basic: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' }
        const color: Record<string, string> = { basic: 'bg-green-100 text-green-700', intermediate: 'bg-blue-100 text-blue-700', advanced: 'bg-purple-100 text-purple-700' }
        return <span className={`px-2 py-1 rounded text-xs font-medium ${color[c.level] || 'bg-gray-100'}`}>{map[c.level] || c.level}</span>
      }
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      render: (c) => {
        const map: Record<string, string> = { draft: 'Nháp', published: 'Công khai', archived: 'Lưu trữ' }
        const color: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', published: 'bg-green-100 text-green-700', archived: 'bg-yellow-100 text-yellow-700' }
        return <span className={`px-2 py-1 rounded text-xs font-medium ${color[c.status] || 'bg-gray-100'}`}>{map[c.status] || c.status}</span>
      }
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      render: (c) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-5 h-5" /></button>
          <button onClick={() => setDeleteCourse(c)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-5 h-5" /></button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý khóa học</h1>
          <p className="text-gray-600 mt-1">Quản lý nội dung và chương trình học</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium">
          <Plus className="w-5 h-5" /> Thêm khóa học
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-wrap gap-2 bg-gray-50/80 p-1.5 rounded-xl border border-gray-100">
            {[
              { value: '', label: 'Tất cả' },
              { value: 'published', label: 'Công khai' },
              { value: 'draft', label: 'Bản nháp' },
              { value: 'archived', label: 'Lưu trữ' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${statusFilter === tab.value
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-1 md:flex-none gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
            </div>

            <div className="relative min-w-[160px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BarChart className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer text-gray-600 font-medium"
              >
                <option value="">Trình độ</option>
                <option value="basic">Cơ bản</option>
                {/* <option value="intermediate">Trung cấp</option> */}
                <option value="advanced">Nâng cao</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={courses} isLoading={isLoading} keyExtractor={(c) => c.id} />

      {!isLoading && courses.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
          onPageChange={setPage}
          totalItems={total}
          itemsPerPage={limit}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setEditingCourse(null) }}
        title={editingCourse ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
        size="4xl"
      >
        {editingCourse ? (
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('basic')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Thông tin chung
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'curriculum'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Nội dung khóa học
              </button>
            </nav>
          </div>
        ) : null}

        {activeTab === 'basic' || !editingCourse ? (
          <form onSubmit={editingCourse ? handleUpdate : handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tên khóa học <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Nhập tên khóa học..."
                    />
                  </div>
                </div>

                {/* Price Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Giá chính thức <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giá gốc (để gạch)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={formData.original_price || ''}
                        onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Level & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trình độ</label>
                    <div className="relative">
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 appearance-none"
                      >
                        <option value="basic">Cơ bản</option>
                        <option value="intermediate">Trung cấp</option>
                        <option value="advanced">Nâng cao</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái</label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 appearance-none"
                      >
                        <option value="draft">Bản nháp</option>
                        <option value="published">Công khai</option>
                        <option value="archived">Lưu trữ</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lớp (Grade)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Layers className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.grade || ''}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      placeholder="VD: 10, 11, 12, Đại học..."
                    />
                  </div>
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`
                    w-5 h-5 rounded border flex items-center justify-center transition-colors
                    ${formData.is_featured
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-transparent group-hover:border-blue-400'}
                  `}>
                      <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="hidden"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      Đánh dấu là khóa học nổi bật
                    </span>
                  </label>
                </div>
              </div>

              {/* Right Column: Media & Description */}
              <div className="space-y-6">
                {/* Thumbnail URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Link ảnh thumbnail</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Image className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      placeholder="https://..."
                    />
                  </div>
                  {formData.image_url && (
                    <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.image_url} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Video Preview URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Link video giới thiệu (YouTube)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Video className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.video_preview_url || ''}
                      onChange={handleVideoUrlChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả ngắn</label>
                  <textarea
                    rows={2}
                    maxLength={150}
                    required
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Mô tả ngắn gọn về khóa học (tối đa 150 ký tự)..."
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {formData.short_description?.length || 0}/150
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 my-4"></div>

            {/* Section: Details */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Chi tiết khóa học
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả chi tiết</label>
                  <textarea
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Nội dung chi tiết khóa học..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bạn sẽ học được gì? (mỗi ý 1 dòng)</label>
                    <textarea
                      rows={4}
                      value={formData.what_you_learn}
                      onChange={(e) => setFormData({ ...formData, what_you_learn: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Kiến thức A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Yêu cầu đầu vào (mỗi ý 1 dòng)</label>
                    <textarea
                      rows={4}
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Cần máy tính"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    {editingCourse ? 'Lưu thay đổi' : 'Tạo khóa học'}
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4">
            {editingCourse && <CurriculumEditor courseId={editingCourse.id} />}
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteCourse}
        onClose={() => setDeleteCourse(null)}
        title="Xác nhận xóa"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteCourse(null)} className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium">Hủy</button>
            <button onClick={handleDelete} className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium shadow-lg shadow-red-500/30">Xóa</button>
          </>
        }
      >
        <div className="p-1 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa khóa học này?</h3>
          <p className="text-gray-500">
            Bạn có chắc chắn muốn xóa khóa học <span className="font-bold text-gray-800">{deleteCourse?.title}</span>? Hành động này không thể hoàn tác.
          </p>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
