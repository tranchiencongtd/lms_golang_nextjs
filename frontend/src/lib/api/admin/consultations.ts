import apiClient from '../axios'
import { API_ENDPOINTS } from '../config'

export interface ConsultationRequest {
  id: string
  student_name: string
  parent_name: string
  phone: string
  birth_year: number
  grade: string
  academic_level: string
  status: 'pending' | 'contacted' | 'completed'
  note?: string
  created_at: string
  updated_at: string
}

export interface PaginatedConsultations {
  items: ConsultationRequest[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export const adminConsultationsApi = {
  list: async (params: { page?: number; page_size?: number }) => {
    // Assuming the router is mounted at /api/v1/admin/consultations
    // Check API_ENDPOINTS structure
    // If not defined, default to /admin/consultations
    const response = await apiClient.get('/admin/consultations', { params })
    return response.data.data
  },

  update: async (id: string, data: { status: string; note: string }) => {
    const response = await apiClient.put(`/admin/consultations/${id}`, data)
    return response.data.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/admin/consultations/${id}`)
    return response.data
  }
}
