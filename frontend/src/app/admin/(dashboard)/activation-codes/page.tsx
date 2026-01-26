'use client'

import { useState, useEffect } from 'react'
import { Plus, Copy, CheckCircle2, AlertCircle, Calendar, Hash, FileText, Trash2, AlertTriangle } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import Pagination from '@/components/admin/Pagination'
import Modal from '@/components/admin/Modal'
import Toast, { ToastType } from '@/components/admin/Toast'
import { adminActivationCodesApi, ActivationCode } from '@/lib/api/admin/activation-codes'
import { adminCoursesApi, Course } from '@/lib/api/admin/courses'

export default function ActivationCodesPage() {
  const [codes, setCodes] = useState<ActivationCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)

  // Create State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [createForm, setCreateForm] = useState({
    course_id: '',
    max_uses: '',
    expires_at: '',
    note: ''
  })

  // Filter & Sort State
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Delete State
  const [deleteCode, setDeleteCode] = useState<ActivationCode | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const showToast = (message: string, type: ToastType) => setToast({ message, type })

  useEffect(() => {
    fetchCodes()
  }, [page, selectedCourseId]) // Refetch when page or course filter changes

  useEffect(() => {
    // Load courses for filter dropdown
    fetchCourses()
  }, []) // Load once on mount

  useEffect(() => {
    if (isCreateModalOpen) {
      fetchCourses()
    }
  }, [isCreateModalOpen])

  const fetchCodes = async () => {
    setIsLoading(true)
    try {
      const params: any = { page, page_size: limit }
      if (selectedCourseId) {
        params.course_id = selectedCourseId
      }

      const data = await adminActivationCodesApi.list(params)
      setCodes(data.items || [])
      setTotal(data.pagination?.total || 0)
    } catch (err) {
      console.error(err)
      showToast('Không thể tải danh sách mã', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      // Fetch all courses for dropdown (limit 100 for now)
      const data = await adminCoursesApi.list({ page: 1, page_size: 100, status: 'published' })
      setCourses(data.items || [])
    } catch (err) {
      console.error(err)
      showToast('Không thể tải danh sách khóa học', 'error')
    }
  }

  const handleCreate = async () => {
    if (!createForm.course_id) {
      showToast('Vui lòng chọn khóa học', 'error')
      return
    }

    try {
      const payload: any = {
        course_id: createForm.course_id,
        note: createForm.note
      }

      if (createForm.max_uses) {
        payload.max_uses = parseInt(createForm.max_uses)
      }

      if (createForm.expires_at) {
        // Add time to make it end of day or specific time if needed. 
        // Input type="date" returns YYYY-MM-DD. 
        // Need RFC3339. Let's append T23:59:59Z for end of day.
        payload.expires_at = new Date(createForm.expires_at + 'T23:59:59Z').toISOString()
      }

      await adminActivationCodesApi.create(payload)
      setIsCreateModalOpen(false)
      setCreateForm({ course_id: '', max_uses: '', expires_at: '', note: '' })
      fetchCodes()
      showToast('Tạo mã kích hoạt thành công', 'success')
    } catch (err: any) {
      console.error(err)
      showToast(err.response?.data?.message || 'Lỗi khi tạo mã', 'error')
    }
  }

  const openDeleteModal = (code: ActivationCode) => {
    setDeleteCode(code)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteCode) return
    try {
      await adminActivationCodesApi.delete(deleteCode.id)
      setDeleteCode(null)
      setIsDeleteModalOpen(false)
      fetchCodes()
      showToast('Xóa mã kích hoạt thành công', 'success')
    } catch (err) {
      console.error(err)
      showToast('Lỗi khi xóa mã', 'error')
    }
  }

  const handleToggleStatus = async (code: ActivationCode) => {
    try {
      const newStatus = !code.is_active
      // Optimistic update
      setCodes(prev => prev.map(c => c.id === code.id ? { ...c, is_active: newStatus } : c))

      await adminActivationCodesApi.update(code.id, { is_active: newStatus })
      showToast(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} mã`, 'success')
    } catch (err) {
      console.error(err)
      // Revert if failed
      setCodes(prev => prev.map(c => c.id === code.id ? { ...c, is_active: code.is_active } : c))
      showToast('Lỗi khi cập nhật trạng thái', 'error')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast('Đã sao chép mã', 'success')
  }

  const columns: Column<ActivationCode>[] = [
    {
      key: 'code',
      label: 'MÃ KÍCH HOẠT',
      render: (r) => (
        <div className="flex items-center gap-2 group">
          <span className={`font-mono font-bold px-2 py-1 rounded border ${!r.is_active ? 'text-gray-500 bg-gray-50 border-gray-200 decoration-line-through' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
            {r.code}
          </span>
          <button
            onClick={() => copyToClipboard(r.code)}
            className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Sao chép"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      key: 'course',
      label: 'KHÓA HỌC',
      render: (r) => (
        <div className="max-w-[200px] truncate" title={r.course?.title}>
          {r.course?.title || 'Unknown Course'}
        </div>
      )
    },
    {
      key: 'usage',
      label: 'LƯỢT DÙNG',
      render: (r) => {
        const isUnlimited = r.max_uses === undefined || r.max_uses === null
        const percent = isUnlimited ? 0 : Math.min(100, (r.current_uses / r.max_uses!) * 100)

        return (
          <div>
            <div className="flex items-center gap-1 text-sm">
              <span className="font-medium text-gray-900">{r.current_uses}</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{isUnlimited ? '∞' : r.max_uses}</span>
            </div>
            {!isUnlimited && (
              <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                <div className={`h-full rounded-full ${percent >= 100 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${percent}%` }}></div>
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      render: (r) => {
        let status = { label: 'Hoạt động', color: 'text-green-700 bg-green-100' }

        if (!r.is_active) {
          status = { label: 'Vô hiệu', color: 'text-gray-500 bg-gray-100' }
        } else if (r.expires_at && new Date(r.expires_at) < new Date()) {
          status = { label: 'Hết hạn', color: 'text-red-700 bg-red-100' }
        } else if (r.max_uses && r.current_uses >= r.max_uses) {
          status = { label: 'Hết lượt', color: 'text-orange-700 bg-orange-100' }
        }

        return (
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={r.is_active}
                onChange={() => handleToggleStatus(r)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className={`px-2 py-0.5 rounded text-xs font-medium border border-transparent ${status.color}`}>
              {status.label}
            </span>
          </div>
        )
      }
    },
    {
      key: 'note',
      label: 'GHI CHÚ',
      render: (r) => (
        <div className="max-w-[200px] truncate text-sm text-gray-600" title={r.note || ''}>
          {r.note || '-'}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'NGÀY TẠO',
      render: (r) => (
        <div className="text-sm text-gray-500">
          <div>{new Date(r.created_at).toLocaleDateString('vi-VN')}</div>
          {r.expires_at && (
            <div className="text-xs text-orange-600 flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-3 h-3" />
              Hết hạn: {new Date(r.expires_at).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      render: (r) => (
        <button
          onClick={() => openDeleteModal(r)}
          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Xóa mã"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ]

  // Filter and Sort Logic
  const filteredCodes = codes
    .filter(code => {
      if (statusFilter === 'all') return true
      if (statusFilter === 'active') return code.is_active
      if (statusFilter === 'inactive') return !code.is_active
      return true
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mã kích hoạt</h1>
          <p className="text-gray-600 mt-1">Quản lý mã kích hoạt khóa học</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo mã mới
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">KHÓA HỌC</label>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value)
              setPage(1) // Reset to page 1
            }}
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          >
            <option value="">Tất cả khóa học</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div className="w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">TRẠNG THÁI</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Vô hiệu hóa</option>
          </select>
        </div>
        <div className="w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">SẮP XẾP</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={filteredCodes} isLoading={isLoading} keyExtractor={r => r.id} />
      </div>

      {!isLoading && codes.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
          onPageChange={setPage}
          totalItems={total}
          itemsPerPage={limit}
        />
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo mã kích hoạt mới"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Khóa học áp dụng</label>
            <select
              value={createForm.course_id}
              onChange={e => setCreateForm({ ...createForm, course_id: e.target.value })}
              className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            >
              <option value="">-- Chọn khóa học --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Số lượng (Để trống = ∞)</label>
              <div className="relative">
                <input
                  type="number"
                  value={createForm.max_uses}
                  onChange={e => setCreateForm({ ...createForm, max_uses: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="VD: 50"
                  min="1"
                />
                <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày hết hạn (Tùy chọn)</label>
              <div className="relative">
                <input
                  type="date"
                  value={createForm.expires_at}
                  onChange={e => setCreateForm({ ...createForm, expires_at: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú (Nội bộ)</label>
            <div className="relative">
              <textarea
                value={createForm.note}
                onChange={e => setCreateForm({ ...createForm, note: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-h-[80px]"
                placeholder="VD: Mã cho lớp 12A..."
              />
              <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-4" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
            >
              Tạo mã ngay
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa?</h3>
            <p className="text-gray-500 mb-6">
              Bạn có chắc chắn muốn xóa mã kích hoạt <strong>{deleteCode?.code}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
