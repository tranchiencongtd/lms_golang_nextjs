'use client'

import { useState, useEffect } from 'react'
import { Search, Edit2, CheckCircle, XCircle, Loader2, Plus, Filter, Eye, EyeOff, Mail, Lock, User, Phone, Shield, Trash2, AlertTriangle } from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'
import Pagination from '@/components/admin/Pagination'
import Modal from '@/components/admin/Modal'
import Toast, { ToastType } from '@/components/admin/Toast'
import { adminUsersApi, AdminUser } from '@/lib/api/admin/users'
import { formatDateTime } from '@/lib/utils'

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit State
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    role: 'student',
    is_active: true,
    is_verified: false
  })

  // Create State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createData, setCreateData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    role: 'student'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminUsersApi.list({ page, limit, search, role: roleFilter || undefined })
      setUsers(data.users)
      setTotal(data.total)
    } catch (err: any) {
      setError('Không thể tải danh sách người dùng')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, search, roleFilter])

  const handleEditClick = (user: AdminUser) => {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name,
      phone_number: user.phone_number,
      role: user.role,
      is_active: user.is_active,
      is_verified: user.is_verified
    })
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    setIsSaving(true)
    try {
      await adminUsersApi.update(editingUser.id, formData as any)
      setEditingUser(null)
      fetchUsers()
      showToast('Cập nhật thông tin thành công', 'success')
    } catch (err) {
      showToast('Không thể cập nhật thông tin', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreate = async () => {
    setIsSaving(true)
    try {
      await adminUsersApi.create(createData)
      setIsCreateModalOpen(false)
      setCreateData({ email: '', password: '', full_name: '', phone_number: '', role: 'student' }) // Reset
      setPage(1)
      fetchUsers()
      showToast('Tạo người dùng thành công', 'success')
    } catch (err: any) {
      const msg = err.response?.status === 409 ? 'Email đã tồn tại' : 'Không thể tạo người dùng'
      showToast(msg, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (user: AdminUser) => {
    setDeleteUser(user)
  }

  const handleConfirmDelete = async () => {
    if (!deleteUser) return
    setIsSaving(true)
    try {
      await adminUsersApi.delete(deleteUser.id)
      setDeleteUser(null)
      fetchUsers()
      showToast('Đã xóa người dùng thành công', 'success')
    } catch (err) {
      showToast('Không thể xóa người dùng. Có thể có dữ liệu liên quan.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (user: AdminUser) => {
    if (!confirm(`Bạn có chắc muốn ${user.is_active ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản này?`)) return
    try {
      await adminUsersApi.toggleStatus(user.id, !user.is_active)
      fetchUsers()
      showToast(`Đã ${!user.is_active ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`, 'success')
    } catch (err) {
      showToast('Không thể cập nhật trạng thái', 'error')
    }
  }

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn người dùng "${user.full_name}"? Hành động này không thể hoàn tác.`)) return

    // Double confirm for safety
    if (!confirm(`Xác nhận lần cuối: Xóa người dùng ${user.email}?`)) return

    try {
      await adminUsersApi.delete(user.id)
      fetchUsers()
      showToast('Đã xóa người dùng thành công', 'success')
    } catch (err) {
      showToast('Không thể xóa người dùng. Có thể người dùng này đang có dữ liệu liên quan (khóa học, đơn hàng...).', 'error')
    }
  }

  const columns: Column<AdminUser>[] = [
    {
      key: 'user',
      label: 'NGƯỜI DÙNG',
      render: (user) => (
        <div>
          <div className="font-medium text-gray-900">{user.full_name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'phone_number',
      label: 'SỐ ĐIỆN THOẠI',
      render: (user) => user.phone_number || <span className="text-gray-400">---</span>
    },
    {
      key: 'role',
      label: 'VAI TRÒ',
      render: (user) => {
        const roleLabels = {
          admin: { text: 'Quản trị', color: 'bg-purple-100 text-purple-700' },
          teacher: { text: 'Giảng viên', color: 'bg-blue-100 text-blue-700' },
          student: { text: 'Học viên', color: 'bg-gray-100 text-gray-700' },
        }
        const role = roleLabels[user.role]
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${role.color}`}>
            {role.text}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      render: (user) => (
        <div className="space-y-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'NGÀY TẠO',
      render: (user) => <span className="text-sm text-gray-600">{formatDateTime(user.created_at)}</span>,
    },
    {
      key: 'actions',
      label: 'THA0 TÁC',
      render: (user) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditClick(user)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded bg-blue-50/50 transition-colors"
            title="Chỉnh sửa thông tin"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleDeleteClick(user)}
            className="p-2 text-red-600 hover:bg-red-50 rounded bg-red-50/50 transition-colors"
            title="Xóa người dùng"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">Quản lý tài khoản và phân quyền</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-5 h-5" />
          Thêm người dùng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              className="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 cursor-pointer"
              style={{ backgroundImage: 'none' }} // Remove default arrow if needed, but keeping standard is fine
            >
              <option value="">Tất cả vai trò</option>
              <option value="student">Học viên</option>
              <option value="teacher">Giảng viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
            {/* Custom Arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <DataTable columns={columns} data={users} isLoading={isLoading} keyExtractor={(u) => u.id} />

      {!isLoading && users.length > 0 && (
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
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Chỉnh sửa thông tin"
        size="md"
        footer={
          <>
            <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Hủy</button>
            <button onClick={handleUpdate} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Lưu thay đổi
            </button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Form content same as before ... */}
          {/* I'll reduce duplication for brevity in this tool call, but full content will be written */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <label className="block text-xs font-medium text-gray-500 uppercase">Email (Không thể thay đổi)</label>
            <p className="font-medium text-gray-900 mt-1">{editingUser?.email}</p>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1.5">Họ và tên</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-base"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1.5">Số điện thoại</label>
            <input
              type="text"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-base"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1.5">Vai trò</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-base"
            >
              <option value="student">Học viên</option>
              <option value="teacher">Giảng viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-base font-medium text-gray-700">Đang hoạt động</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={formData.is_verified} onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-base font-medium text-gray-700">Đã xác thực</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm người dùng mới"
        size="md"
        footer={
          <>
            <button onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors">Hủy</button>
            <button onClick={handleCreate} disabled={isSaving} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/40">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Tạo tài khoản
            </button>
          </>
        }
      >
        <div className="space-y-5 p-1">
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={createData.email}
                  onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-base"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Mật khẩu <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={createData.password}
                  onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-base"
                  placeholder="Tối thiểu 8 ký tự"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Họ và tên <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>


                  <input
                    type="text"
                    value={createData.full_name}
                    onChange={(e) => setCreateData({ ...createData, full_name: e.target.value })}
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-base"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Số điện thoại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={createData.phone_number}
                    onChange={(e) => setCreateData({ ...createData, phone_number: e.target.value })}
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-base"
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Vai trò</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={createData.role}
                  onChange={(e) => setCreateData({ ...createData, role: e.target.value })}
                  className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-base appearance-none cursor-pointer"
                >
                  <option value="student">Học viên (Student)</option>
                  <option value="teacher">Giảng viên (Teacher)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <p className="mt-1.5 text-xs text-gray-500 ml-1">
                * Học viên sẽ có quyền truy cập mặc định vào các khóa học công khai.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        title="Xác nhận xóa người dùng"
        size="md"
        footer={
          <>
            <button onClick={() => setDeleteUser(null)} className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors">Hủy bỏ</button>
            <button onClick={handleConfirmDelete} disabled={isSaving} className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-red-500/30 transition-all hover:shadow-red-500/40">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Xác nhận xóa
            </button>
          </>
        }
      >
        <div className="p-1">
          <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-100 rounded-xl mb-5">
            <div className="p-2 bg-white rounded-full shadow-sm flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h4 className="font-bold text-red-900 text-base">Hành động này không thể hoàn tác!</h4>
              <p className="text-sm text-red-700 mt-1">
                Tài khoản người dùng và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống.
              </p>
            </div>
          </div>

        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
