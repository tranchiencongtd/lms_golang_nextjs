/**
 * Authentication API Service
 */

import apiClient from './axios'
import { API_ENDPOINTS } from './config'
import { setAccessToken, setRefreshToken } from './tokenStorage'

export interface LoginRequest {
  email_or_phone: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  phone_number: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface User {
  id: string
  email: string
  full_name: string
  avatar?: string
  phone_number: string
  role: 'student' | 'teacher' | 'admin'
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    API_ENDPOINTS.auth.register,
    data
  )

  const { access_token, refresh_token } = response.data.data
  setAccessToken(access_token)
  setRefreshToken(refresh_token)

  return response.data.data
}

/**
 * Login user
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    API_ENDPOINTS.auth.login,
    data
  )

  const { access_token, refresh_token } = response.data.data
  setAccessToken(access_token)
  setRefreshToken(refresh_token)

  return response.data.data
}

/**
 * Refresh access token
 */
export async function refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    API_ENDPOINTS.auth.refreshToken,
    data
  )

  const { access_token, refresh_token } = response.data.data
  setAccessToken(access_token)
  if (refresh_token) {
    setRefreshToken(refresh_token)
  }

  return response.data.data
}

/**
 * Logout user
 */
export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post(API_ENDPOINTS.auth.logout, {
    refresh_token: refreshToken,
  })
}

/**
 * Logout from all devices
 */
export async function logoutAll(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.auth.logoutAll)
}

/**
 * Get user profile
 */
export async function getProfile(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.auth.profile)
  return response.data.data
}
