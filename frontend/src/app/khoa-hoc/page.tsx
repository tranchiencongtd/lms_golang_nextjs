import { Metadata } from 'next'
import CoursesClient from './CoursesClient'

export const metadata: Metadata = {
  title: 'Danh sách khóa học',
  description: 'Khám phá các khóa học toán chất lượng cao từ lớp 6-12, luyện thi THPT Quốc Gia với giáo viên giàu kinh nghiệm.',
  openGraph: {
    title: 'Danh sách khóa học | Thầy Trần Chiến',
    description: 'Kho khóa học toán đa dạng, lộ trình bài bản, giúp học sinh nắm vững kiến thức và bứt phá điểm số.',
  }
}

export default function CoursesPage() {
  return <CoursesClient />
}
