import apiClient from './axios'
import { API_ENDPOINTS } from './config'

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  short_description: string
  instructor_id: string
  price: number
  original_price?: number
  image_url?: string
  video_preview_url?: string
  rating: number
  total_reviews: number
  total_students: number
  total_lessons: number
  duration_minutes: number
  level: 'basic' | 'intermediate' | 'advanced'
  grade?: string
  topic?: string
  language: string
  badge?: string
  badge_color?: string
  certificate: boolean
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  created_at: string
  updated_at: string
  instructor?: {
    id: string
    full_name: string
    email: string
    avatar?: string
  }
  sections?: CourseSection[]
}

export interface CourseSection {
  id: string
  course_id: string
  title: string
  description: string
  order_index: number
  created_at: string
  updated_at: string
  lessons?: CourseLesson[]
}

export interface CourseLesson {
  id: string
  section_id: string
  course_id: string
  title: string
  description: string
  video_url?: string
  youtube_id?: string
  duration_minutes: number
  order_index: number
  is_preview: boolean
  created_at: string
  updated_at: string
}

export interface CourseListResponse {
  courses: Course[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}

export interface CourseListParams {
  status?: 'draft' | 'published' | 'archived'
  level?: 'basic' | 'intermediate' | 'advanced'
  grade?: string
  topic?: string
  search?: string
  featured?: boolean
  sort?: 'created_at_desc' | 'created_at_asc' | 'price_asc' | 'price_desc' | 'rating_desc' | 'students_desc'
  page?: number
  page_size?: number
}

/**
 * Get list of courses with filters and pagination
 */
export async function getCourses(params?: CourseListParams): Promise<CourseListResponse> {
  const queryParams = new URLSearchParams()
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })
  }

  const response = await apiClient.get<{ success: boolean; message: string; data: CourseListResponse }>(
    `${API_ENDPOINTS.courses.list}?${queryParams.toString()}`
  )

  return response.data.data
}

/**
 * Get a single course by ID or slug
 */
export async function getCourse(idOrSlug: string, includeDetails = false): Promise<Course> {
  const url = includeDetails 
    ? `${API_ENDPOINTS.courses.get(idOrSlug)}?details=true`
    : API_ENDPOINTS.courses.get(idOrSlug)

  const response = await apiClient.get<{ success: boolean; message: string; data: Course }>(url)

  return response.data.data
}
