/**
 * Utility functions for formatting and common operations
 */

/**
 * Format price to Vietnamese currency format
 * @param price - The price number to format
 * @returns Formatted price string (e.g., "1.200.000đ")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

/**
 * Format duration from minutes or "MM:SS" string to Vietnamese readable format
 * @param duration - Duration in minutes (number) or string format "MM:SS" (e.g., "10:00", "90:00")
 * @returns Formatted duration string (e.g., "10 phút", "1 giờ 30 phút")
 */
export function formatDuration(duration: string | number): string {
  let minutes: number

  if (typeof duration === 'number') {
    minutes = duration
  } else {
    [minutes] = duration.split(':').map(Number)
  }

  if (isNaN(minutes) || minutes <= 0) {
    return '0 phút'
  }

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours} giờ`
    }
    return `${hours} giờ ${remainingMinutes} phút`
  }
  return `${minutes} phút`
}

/**
 * Format date to Vietnamese locale
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "22/01/2026")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  } catch {
    return dateString
  }
}

/**
 * Format date with time to Vietnamese locale
 * @param dateString - ISO date string
 * @returns Formatted date time string (e.g., "22/01/2026 09:30")
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return dateString
  }
}

/**
 * Format relative time (e.g., "2 ngày trước")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)
    const diffMonth = Math.floor(diffDay / 30)
    const diffYear = Math.floor(diffDay / 365)

    if (diffYear > 0) return `${diffYear} năm trước`
    if (diffMonth > 0) return `${diffMonth} tháng trước`
    if (diffDay > 0) return `${diffDay} ngày trước`
    if (diffHour > 0) return `${diffHour} giờ trước`
    if (diffMin > 0) return `${diffMin} phút trước`
    return 'Vừa xong'
  } catch {
    return dateString
  }
}

/**
 * Format number with Vietnamese locale
 * @param num - The number to format
 * @returns Formatted number string (e.g., "1.234.567")
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num)
}

/**
 * Get YouTube thumbnail URL from video ID
 * @param videoId - YouTube video ID
 * @param quality - Thumbnail quality ('default' | 'mq' | 'hq' | 'maxres')
 * @returns YouTube thumbnail URL
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: 'default' | 'mq' | 'hq' | 'maxres' = 'hq'
): string {
  const qualityMap = {
    default: 'default',
    mq: 'mqdefault',
    hq: 'hqdefault',
    maxres: 'maxresdefault'
  }
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

/**
 * Extract YouTube video ID from URL
 * @param url - YouTube video URL
 * @returns Video ID or null if not found
 */
export function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

/**
 * Get YouTube embed URL from video ID
 * @param videoId - YouTube video ID
 * @returns YouTube embed URL
 */
export function getYouTubeEmbedUrl(
  videoId: string,
  options: { autoplay?: boolean; muted?: boolean; start?: number } = {}
): string {
  const params = new URLSearchParams()
  // rel=0: Show related videos from the same channel only (best effort to hide recommendations)
  params.append('rel', '0')
  // modestbranding=1: Minimize YouTube branding
  params.append('modestbranding', '1')
  // iv_load_policy=3: Hide video annotations
  params.append('iv_load_policy', '3')

  // Thêm tham số để chặn đề xuất video từ kênh khác
  params.append('playlist', videoId)

  if (options.autoplay) params.append('autoplay', '1')
  if (options.muted) params.append('mute', '1')
  if (options.start) params.append('start', options.start.toString())

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Generate slug from Vietnamese text
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
  const vietnameseMap: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
    'Đ': 'D'
  }

  return text
    .split('')
    .map(char => vietnameseMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
