import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, GripVertical, ChevronDown, ChevronRight, Video, FileText, AlertTriangle } from 'lucide-react'
import {
  adminCoursesApi,
  Course,
  CourseSection,
  CourseLesson,
  CreateSectionInput,
  CreateLessonInput
} from '@/lib/api/admin/courses'

interface CurriculumEditorProps {
  courseId: string
}

export default function CurriculumEditor({ courseId }: CurriculumEditorProps) {
  const [sections, setSections] = useState<CourseSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for creating/editing section
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<CourseSection | null>(null)
  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionDescription, setSectionDescription] = useState('')

  // State for creating/editing lesson
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null)

  const [lessonForm, setLessonForm] = useState<Partial<CreateLessonInput>>({
    title: '',
    description: '',
    video_url: '',
    duration_minutes: 0,
    is_preview: false
  })

  // State for Delete Confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'section' | 'lesson' | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchCurriculum()
  }, [courseId])

  const fetchCurriculum = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const course = await adminCoursesApi.get(courseId, true) as Course & { sections?: CourseSection[] }
      // Sort sections by order
      const sortedSections = (course.sections || []).sort((a, b) => a.order_index - b.order_index)

      // Sort lessons in each section
      sortedSections.forEach(section => {
        if (section.lessons) {
          section.lessons.sort((a, b) => a.order_index - b.order_index)
        }
      })

      setSections(sortedSections)
    } catch (err: any) {
      setError(err.message || 'Failed to load curriculum')
    } finally {
      setIsLoading(false)
    }
  }

  // --- Section Handlers ---

  const handleOpenCreateSection = () => {
    setEditingSection(null)
    setSectionTitle('')
    setSectionDescription('')
    setIsSectionModalOpen(true)
  }

  const handleOpenEditSection = (section: CourseSection) => {
    setEditingSection(section)
    setSectionTitle(section.title)
    setSectionDescription(section.description || '')
    setIsSectionModalOpen(true)
  }

  const handleSaveSection = async () => {
    try {
      if (editingSection) {
        // Update
        await adminCoursesApi.updateSection(editingSection.id, {
          title: sectionTitle,
          description: sectionDescription,
          course_id: courseId,
          order_index: editingSection.order_index
        })
      } else {
        // Create
        await adminCoursesApi.createSection({
          course_id: courseId,
          title: sectionTitle,
          description: sectionDescription,
          order_index: sections.length + 1
        })
      }
      setIsSectionModalOpen(false)
      fetchCurriculum()
    } catch (err: any) {
      alert('Failed to save section: ' + err.message)
    }
  }

  const handleDeleteSection = (id: string) => {
    setDeleteType('section')
    setItemToDelete(id)
    setIsDeleteModalOpen(true)
  }

  // --- Lesson Handlers ---

  const handleOpenCreateLesson = (sectionId: string) => {
    setActiveSectionId(sectionId)
    setEditingLesson(null)
    setLessonForm({
      title: '',
      description: '',
      video_url: '',
      duration_minutes: 0,
      is_preview: false
    })
    setIsLessonModalOpen(true)
  }

  const handleOpenEditLesson = (lesson: CourseLesson) => {
    setActiveSectionId(lesson.section_id)
    setEditingLesson(lesson)
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      duration_minutes: lesson.duration_minutes,
      is_preview: lesson.is_preview
    })
    setIsLessonModalOpen(true)
  }

  const handleSaveLesson = async () => {
    if (!activeSectionId) return

    try {
      const currentSection = sections.find(s => s.id === activeSectionId)
      const currentLessonCount = currentSection?.lessons?.length || 0

      if (editingLesson) {
        // Update
        await adminCoursesApi.updateLesson(editingLesson.id, {
          course_id: courseId,
          section_id: activeSectionId,
          title: lessonForm.title || '',
          description: lessonForm.description,
          video_url: lessonForm.video_url,
          duration_minutes: Number(lessonForm.duration_minutes),
          order_index: editingLesson.order_index,
          is_preview: !!lessonForm.is_preview
        })
      } else {
        // Create
        await adminCoursesApi.createLesson({
          course_id: courseId,
          section_id: activeSectionId,
          title: lessonForm.title || '',
          description: lessonForm.description,
          video_url: lessonForm.video_url,
          duration_minutes: Number(lessonForm.duration_minutes),
          order_index: currentLessonCount + 1,
          is_preview: !!lessonForm.is_preview
        })
      }
      setIsLessonModalOpen(false)
      fetchCurriculum()
    } catch (err: any) {
      alert('Failed to save lesson: ' + err.message)
    }
  }

  const handleDeleteLesson = (id: string) => {
    setDeleteType('lesson')
    setItemToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !deleteType) return

    try {
      if (deleteType === 'section') {
        await adminCoursesApi.deleteSection(itemToDelete)
      } else {
        await adminCoursesApi.deleteLesson(itemToDelete)
      }
      fetchCurriculum()
      setIsDeleteModalOpen(false)
      setItemToDelete(null)
      setDeleteType(null)
    } catch (err: any) {
      alert('Failed to delete: ' + err.message)
    }
  }

  if (isLoading && sections.length === 0) return <div>Loading curriculum...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Nội dung khóa học</h3>
        <button
          onClick={handleOpenCreateSection}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> Thêm chương mới
        </button>
      </div>

      <div className="space-y-4">
        {sections.length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-500">
            Chưa có nội dung nào. Hãy tạo chương đầu tiên!
          </div>
        )}

        {sections.map((section) => (
          <div key={section.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200 gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 truncate" title={section.title}>{section.title}</h4>
                  {section.description && <p className="text-sm text-gray-500 truncate" title={section.description}>{section.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleOpenEditSection(section)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteSection(section.id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenCreateLesson(section.id)}
                  className="ml-2 flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 border border-gray-300 text-white rounded hover:bg-blue-700"
                >
                  <Plus className="w-3 h-3" /> Bài học
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {(section.lessons || []).length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-400 italic">Chưa có bài học nào</div>
              )}
              {section.lessons?.map((lesson) => (
                <div key={lesson.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 group gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 flex justify-center text-gray-400 flex-shrink-0">
                      {lesson.video_url ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-sm font-medium text-gray-900 truncate" title={lesson.title}>{lesson.title}</h5>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex-shrink-0">{lesson.duration_minutes} phút</span>
                        {lesson.is_preview && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase flex-shrink-0">Học thử</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditLesson(lesson)}
                      className="p-1.5 text-gray-500 hover:text-blue-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Create/Edit Section */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">{editingSection ? 'Sửa chương học' : 'Thêm chương mới'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                <input
                  value={sectionTitle}
                  onChange={e => setSectionTitle(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  placeholder="Ví dụ: Chương 1: Giới thiệu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  value={sectionDescription}
                  onChange={e => setSectionDescription(e.target.value)}
                  className="w-full border rounded-lg p-2 h-24"
                  placeholder="Mô tả nội dung chương..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveSection}
                disabled={!sectionTitle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create/Edit Lesson */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold mb-4">{editingLesson ? 'Sửa bài học' : 'Thêm bài học mới'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
                <input
                  value={lessonForm.title}
                  onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  placeholder="Ví dụ: Bài 1: Cài đặt môi trường"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Video URL (YouTube) *</label>
                <input
                  value={lessonForm.video_url}
                  onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Thời lượng (phút)</label>
                  <input
                    type="number"
                    min="0"
                    value={lessonForm.duration_minutes || ''}
                    onChange={e => setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lessonForm.is_preview}
                      onChange={e => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Cho phép học thử</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  value={lessonForm.description}
                  onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="w-full border rounded-lg p-2 h-20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveLesson}
                disabled={!lessonForm.title || !lessonForm.video_url}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa?</h3>
            <p className="text-gray-500 mb-6">
              {deleteType === 'section'
                ? 'Bạn có chắc chắn muốn xóa chương này? Tất cả bài học trong chương sẽ bị xóa vĩnh viễn.'
                : 'Bạn có chắc chắn muốn xóa bài học này? Hành động này không thể hoàn tác.'
              }
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
