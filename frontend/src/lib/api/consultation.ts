import apiClient from './axios'
import { API_ENDPOINTS } from './config'

export interface CreateConsultationRequest {
  student_name: string
  parent_name: string
  phone: string
  birth_year: number
  grade: string
  academic_level: string
}

export const consultation = {
  create: async (data: CreateConsultationRequest) => {
    const response = await apiClient.post(API_ENDPOINTS.consultations.create, data)
    return response.data
  },
}
