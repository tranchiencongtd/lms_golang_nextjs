'use client'

import { useState, useEffect } from 'react'
import { Edit2, Trash2, Phone, AlertTriangle } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import Pagination from '@/components/admin/Pagination'
import Modal from '@/components/admin/Modal'
import Toast, { ToastType } from '@/components/admin/Toast'
import { adminConsultationsApi, ConsultationRequest } from '@/lib/api/admin/consultations'

export default function ConsultationsPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(6)
  const [total, setTotal] = useState(0)

  // Edit State
  const [editingRequest, setEditingRequest] = useState<ConsultationRequest | null>(null)
  const [editForm, setEditForm] = useState({ status: '', note: '' })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Delete State
  const [deleteRequest, setDeleteRequest] = useState<ConsultationRequest | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'contacted' | 'completed'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const showToast = (message: string, type: ToastType) => setToast({ message, type })

  useEffect(() => {
    fetchRequests()
  }, [page])

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const data = await adminConsultationsApi.list({ page, page_size: limit })
      setRequests(data.items || [])
      setTotal(data.pagination?.total || 0)
    } catch (err) {
      console.error(err)
      showToast('Không thể tải danh sách', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingRequest) return
    try {
      await adminConsultationsApi.update(editingRequest.id, editForm)
      setIsEditModalOpen(false)
      fetchRequests()
      showToast('Cập nhật trạng thái thành công', 'success')
    } catch (err) {
      console.error(err)
      showToast('Lỗi khi cập nhật', 'error')
    }
  }

  const openDeleteModal = (req: ConsultationRequest) => {
    setDeleteRequest(req)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteRequest) return
    try {
      await adminConsultationsApi.delete(deleteRequest.id)
      setDeleteRequest(null)
      setIsDeleteModalOpen(false)
      fetchRequests()
      showToast('Xóa yêu cầu thành công', 'success')
    } catch (err) {
      console.error(err)
      showToast('Lỗi khi xóa', 'error')
    }
  }

  const openEdit = (req: ConsultationRequest) => {
    setEditingRequest(req)
    setEditForm({ status: req.status, note: req.note || '' })
    setIsEditModalOpen(true)
  }

  const columns: Column<ConsultationRequest>[] = [
    {
      key: 'student_name',
      label: 'HỌC SINH / PHỤ HUYNH',
      render: (r) => (
        <div>
          <div className="font-medium text-gray-900">{r.student_name}</div>
          <div className="text-sm text-gray-500">{r.parent_name}</div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'LIÊN HỆ',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{r.phone}</span>
        </div>
      )
    },
    {
      key: 'info',
      label: 'THÔNG TIN',
      render: (r) => {
        const levelMap: Record<string, string> = {
          'yeu': 'Yếu',
          'trung-binh': 'Trung bình',
          'kha': 'Khá',
          'gioi': 'Giỏi',
          'basic': 'Cơ bản',
          'advanced': 'Nâng cao'
        }
        return (
          <div className="text-sm text-gray-600">
            <div>Lớp: {r.grade}</div>
            <div>Học lực: {levelMap[r.academic_level] || r.academic_level}</div>
            <div>Năm sinh: {r.birth_year}</div>
          </div>
        )
      }
    },
    {
      key: 'created_at',
      label: 'NGÀY GỬI',
      render: (r) => <span className="text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      render: (r) => {
        const statusMap: any = {
          pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
          contacted: { label: 'Đã liên hệ', color: 'bg-blue-100 text-blue-700' },
          completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' }
        }
        const s = statusMap[r.status] || { label: r.status, color: 'bg-gray-100' }
        return (
          <div className="flex flex-col gap-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${s.color}`}>{s.label}</span>
            {r.note && <span className="text-xs text-gray-500 italic max-w-[150px] truncate" title={r.note}>{r.note}</span>}
          </div>
        )
      }
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Cập nhật"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => openDeleteModal(r)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Xóa"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ]

  // Filter & Sort Logic
  const filteredRequests = requests.filter(req => {
    if (statusFilter === 'all') return true
    return req.status === statusFilter
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
          <h1 className="text-2xl font-semibold text-gray-900">Yêu cầu tư vấn</h1>
          <p className="text-gray-600 mt-1">Quản lý danh sách đăng ký tư vấn từ học viên</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">TRẠNG THÁI</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="contacted">Đã liên hệ</option>
            <option value="completed">Hoàn thành</option>
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
        <DataTable columns={columns} data={filteredRequests} isLoading={isLoading} keyExtractor={r => r.id} />
      </div>

      {!isLoading && requests.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
          onPageChange={setPage}
          totalItems={total}
          itemsPerPage={limit}
        />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Cập nhật trạng thái tư vấn"
      >
        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              Thông tin đăng ký
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block text-xs mb-0.5">Học sinh</span>
                <span className="font-medium text-gray-900">{editingRequest?.student_name}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs mb-0.5">Phụ huynh</span>
                <span className="font-medium text-gray-900">{editingRequest?.parent_name}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs mb-0.5">Số điện thoại</span>
                <span className="font-medium text-gray-900 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-blue-600" />
                  {editingRequest?.phone}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs mb-0.5">Năm sinh</span>
                <span className="font-medium text-gray-900">{editingRequest?.birth_year}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái xử lý</label>
              <div className="relative">
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow text-gray-900"
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="contacted">Đã liên hệ</option>
                  <option value="completed">Hoàn thành</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú tư vấn</label>
              <textarea
                value={editForm.note}
                onChange={e => setEditForm({ ...editForm, note: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow min-h-[120px] resize-y placeholder:text-gray-400"
                placeholder="Nhập nội dung ghi chú về nhu cầu học viên hoặc kết quả tư vấn..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-all active:scale-[0.98]"
            >
              Lưu cập nhật
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
              Bạn có chắc chắn muốn xóa yêu cầu tư vấn của <strong>{deleteRequest?.student_name}</strong>? Hành động này không thể hoàn tác.
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
