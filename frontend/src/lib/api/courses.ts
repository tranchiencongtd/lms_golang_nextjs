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
  level: 'basic' | 'advanced'
  grade?: string
  what_you_learn?: string
  requirements?: string
  language?: string
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
  level?: 'basic' | 'advanced'
  grade?: string
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

  const response = await apiClient.get<any>(
    `${API_ENDPOINTS.courses.list}?${queryParams.toString()}`
  )

  // Handle difference between backend "items" and frontend "courses"
  const data = response.data.data
  if (data.items && !data.courses) {
    return {
      courses: data.items,
      pagination: data.pagination
    }
  }

  return data
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

/**
 * Get list of courses for admin (includes all statuses)
 */
export async function getAdminCourses(params?: CourseListParams): Promise<CourseListResponse> {
  const queryParams = new URLSearchParams()

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })
  }

  const response = await apiClient.get<{ success: boolean; message: string; data: CourseListResponse }>(
    `${API_ENDPOINTS.admin.courses}?${queryParams.toString()}`
  )

  return response.data.data
}

/**
 * Create a new course
 */
export async function createCourse(data: Partial<Course>): Promise<Course> {
  const response = await apiClient.post<{ success: boolean; message: string; data: Course }>(
    API_ENDPOINTS.admin.courses,
    data
  )
  return response.data.data
}

/**
 * Update a course
 */
export async function updateCourse(id: string, data: Partial<Course>): Promise<Course> {
  const response = await apiClient.put<{ success: boolean; message: string; data: Course }>(
    `${API_ENDPOINTS.admin.courses}/${id}`,
    data
  )
  return response.data.data
}

/**
 * Delete a course
 */
export async function deleteCourse(id: string): Promise<void> {
  await apiClient.delete(
    `${API_ENDPOINTS.admin.courses}/${id}`
  )
}
