import apiClient from '../axios'
import { API_ENDPOINTS } from '../config'

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  short_description?: string
  price: number
  original_price?: number
  image_url?: string
  video_preview_url?: string
  level: 'basic' | 'intermediate' | 'advanced'
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  total_lessons: number
  total_students: number
  rating: number
  duration_minutes: number
  created_at: string
  updated_at: string
  instructor_id: string
  grade?: string
  what_you_learn?: string
  requirements?: string
}

export interface PaginatedCourses {
  items: Course[]
  page: number
  limit: number // page_size
  total: number
  total_pages: number
}

export interface CreateCourseInput {
  title: string
  slug?: string
  description: string
  short_description: string // Required
  price: number
  original_price?: number
  image_url?: string
  video_preview_url?: string
  level: string
  grade?: string
  what_you_learn?: string
  requirements?: string
  status?: string
  is_featured?: boolean
  rating?: number
  total_reviews?: number
  total_students?: number
  duration_minutes?: number
  total_lessons?: number
}

export const adminCoursesApi = {
  list: async (params: {
    page?: number
    page_size?: number
    search?: string
    status?: string
    level?: string
    sort?: string
  }) => {
    // Note: Backend might use different response structure. 
    // Based on handler code: { items: [], pagination: {} }
    // User handler used: { users: [], ... } -> data.data
    // Course handler used: { items: [], ... } -> data.data

    // BUT apiClient usually unwraps response.data.
    // Let's assume response structure: { success: true, message: "...", data: { items: [], pagination: {} } }

    const response = await apiClient.get(API_ENDPOINTS.admin.courses || '/admin/courses', { params })
    return response.data.data
  },

  get: async (id: string) => {
    const response = await apiClient.get(`${API_ENDPOINTS.admin.courses || '/admin/courses'}/${id}`)
    return response.data.data
  },

  create: async (data: CreateCourseInput) => {
    const response = await apiClient.post(API_ENDPOINTS.admin.courses || '/admin/courses', data)
    return response.data.data
  },

  update: async (id: string, data: Partial<Course>) => {
    const response = await apiClient.put(`${API_ENDPOINTS.admin.courses || '/admin/courses'}/${id}`, data)
    return response.data.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.admin.courses || '/admin/courses'}/${id}`)
    return response.data
  },
}
