import apiClient from '../axios'
import { API_ENDPOINTS } from '../config'

export interface AdminUser {
  id: string
  email: string
  full_name: string
  phone_number: string
  role: 'student' | 'teacher' | 'admin'
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface PaginatedUsers {
  users: AdminUser[]
  total: number
  page: number
  limit: number
  total_pages: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const adminUsersApi = {
  list: async (params: {
    page?: number
    limit?: number
    search?: string
    role?: string
  }) => {
    const response = await apiClient.get<ApiResponse<PaginatedUsers>>(
      `${API_ENDPOINTS.admin.users}`,
      { params }
    )
    return response.data.data
  },

  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.admin.users, data)
    return response.data
  },

  update: async (userId: string, data: Partial<AdminUser>) => {
    const response = await apiClient.put(`${API_ENDPOINTS.admin.users}/${userId}`, data)
    return response.data
  },

  delete: async (userId: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.admin.users}/${userId}`)
    return response.data
  },

  updateRole: async (userId: string, role: 'student' | 'teacher' | 'admin') => {
    const response = await apiClient.put(`${API_ENDPOINTS.admin.users}/${userId}/role`, {
      role,
    })
    return response.data
  },

  toggleStatus: async (userId: string, isActive: boolean) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.admin.users}/${userId}/status`, {
      is_active: isActive,
    })
    return response.data
  },
}
