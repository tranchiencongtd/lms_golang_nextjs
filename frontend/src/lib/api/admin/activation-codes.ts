import apiClient from '../axios'
import { Course } from './courses'

export interface ActivationCode {
  id: string
  code: string
  course_id: string
  max_uses?: number
  current_uses: number
  expires_at?: string
  is_active: boolean
  created_by: string
  note?: string
  created_at: string
  updated_at: string
  course?: Course
}

export interface CreateActivationCodeInput {
  course_id: string
  max_uses?: number
  expires_at?: string // RFC3339
  note?: string
}

export interface PaginatedActivationCodes {
  items: ActivationCode[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}

export const adminActivationCodesApi = {
  list: async (params: { page?: number; page_size?: number; course_id?: string }) => {
    // Assuming the router is mounted at /api/v1/enrollments/activation-codes
    const response = await apiClient.get('/enrollments/activation-codes', { params })
    return response.data.data
  },

  create: async (data: CreateActivationCodeInput) => {
    const response = await apiClient.post('/enrollments/activation-codes', data)
    return response.data.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/enrollments/activation-codes/${id}`)
    return response.data
  },

  update: async (id: string, data: { is_active: boolean }) => {
    const response = await apiClient.put(`/enrollments/activation-codes/${id}`, data)
    return response.data.data
  }
}
