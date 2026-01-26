/**
 * API Configuration
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refreshToken: '/auth/refresh-token',
    logout: '/auth/logout',
    logoutAll: '/auth/logout-all',
    profile: '/auth/profile',
    updateProfile: '/auth/profile',
    changePassword: '/auth/change-password',
  },
  courses: {
    list: '/courses',
    get: (idOrSlug: string) => `/courses/${idOrSlug}`,
  },
  enrollments: {
    activate: '/enrollments/activate',
    myCourses: '/enrollments/my-courses',
    check: (courseId: string) => `/enrollments/check/${courseId}`,
    createActivationCode: '/enrollments/activation-codes',
  },
  consultations: {
    create: '/consultations',
  },
  admin: {
    stats: '/admin/stats',
    users: '/admin/users',
    courses: '/admin/courses',
  },
} as const

