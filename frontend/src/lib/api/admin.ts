import apiClient from './axios'
import { API_ENDPOINTS } from './config'

export interface DashboardStats {
  total_users: number
  total_courses: number
  total_enrollments: number
  pending_consultations: number
  total_revenue: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const adminApi = {
  getStats: async () => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(API_ENDPOINTS.admin.stats)
    return response.data.data
  },
}
