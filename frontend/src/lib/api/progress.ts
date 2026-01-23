import apiClient from './axios'

export interface LessonProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  is_completed: boolean;
  completed_at?: string;
  last_watched_at: string;
  watch_duration_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
  last_lesson_id?: string;
  lesson_progress: LessonProgress[];
}

export interface ProgressResponse {
  success: boolean;
  message: string;
  data: CourseProgress;
}

export interface MarkCompletedResponse {
  success: boolean;
  message: string;
  data: {
    lesson_id: string;
  };
}

export interface UpdateWatchProgressResponse {
  success: boolean;
  message: string;
  data: {
    lesson_id: string;
    duration_seconds: number;
  };
}

// Get course progress
export async function getCourseProgress(courseId: string): Promise<ProgressResponse> {
  const response = await apiClient.get<ProgressResponse>(`/progress/${courseId}`);
  return response.data;
}

// Mark a lesson as completed
export async function markLessonCompleted(courseId: string, lessonId: string): Promise<MarkCompletedResponse> {
  const response = await apiClient.post<MarkCompletedResponse>(
    `/progress/${courseId}/lessons/${lessonId}/complete`
  );
  return response.data;
}

// Update watch progress for a lesson
export async function updateWatchProgress(
  courseId: string,
  lessonId: string,
  durationSeconds: number
): Promise<UpdateWatchProgressResponse> {
  const response = await apiClient.post<UpdateWatchProgressResponse>(
    `/progress/${courseId}/lessons/${lessonId}/watch`,
    { duration_seconds: durationSeconds }
  );
  return response.data;
}

// Update last lesson (when user switches to a new lesson)
export async function updateLastLesson(courseId: string, lessonId: string): Promise<void> {
  await apiClient.post(`/progress/${courseId}/last-lesson/${lessonId}`);
}
