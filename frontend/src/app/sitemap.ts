import { MetadataRoute } from 'next'
import { getCourses } from '@/lib/api/courses'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://thaytranchienedu.vn'

  // Static routes
  const routes = [
    '',
    '/khoa-hoc',
    '/dieu-khoan',
    '/chinh-sach',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    // Dynamic routes for courses
    const { courses } = await getCourses({
      status: 'published',
      page_size: 100 // Adjust based on total courses likely to exist
    })

    const courseRoutes = courses.map((course) => ({
      url: `${baseUrl}/khoa-hoc/${course.slug}`,
      lastModified: new Date(course.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    return [...routes, ...courseRoutes]
  } catch (error) {
    console.error('Failed to generate course sitemap:', error)
    return routes
  }
}
