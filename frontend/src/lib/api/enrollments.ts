import apiClient from './axios'
import { API_ENDPOINTS } from './config'
import { Course } from './courses'

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  activation_code_id?: string
  enrolled_at: string
  expires_at?: string
  status: 'active' | 'expired' | 'cancelled'
  created_at: string
  updated_at: string
  course?: Course
}

export interface ActivateCourseResponse {
  enrollment: Enrollment
  course: Course
}

export interface EnrollmentsListResponse {
  enrollments: Enrollment[]
  total: number
}

export interface CheckEnrollmentResponse {
  is_enrolled: boolean
  course_id: string
}

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
}

/**
 * Activate a course with an activation code
 */
export async function activateCourse(code: string): Promise<ActivateCourseResponse> {
  const response = await apiClient.post<{ success: boolean; message: string; data: ActivateCourseResponse }>(
    API_ENDPOINTS.enrollments.activate,
    { code }
  )

  return response.data.data
}

/**
 * Get the current user's enrolled courses
 */
export async function getMyEnrolledCourses(): Promise<EnrollmentsListResponse> {
  const response = await apiClient.get<{ success: boolean; message: string; data: EnrollmentsListResponse }>(
    API_ENDPOINTS.enrollments.myCourses
  )

  return response.data.data
}

/**
 * Check if the current user is enrolled in a specific course
 */
export async function checkEnrollment(courseId: string): Promise<boolean> {
  const response = await apiClient.get<{ success: boolean; message: string; data: CheckEnrollmentResponse }>(
    API_ENDPOINTS.enrollments.check(courseId)
  )

  return response.data.data.is_enrolled
}

/**
 * Create a new activation code (admin only)
 */
export async function createActivationCode(input: {
  course_id: string
  max_uses?: number
  expires_at?: string
  note?: string
}): Promise<ActivationCode> {
  const response = await apiClient.post<{ success: boolean; message: string; data: ActivationCode }>(
    API_ENDPOINTS.enrollments.createActivationCode,
    input
  )

  return response.data.data
}
