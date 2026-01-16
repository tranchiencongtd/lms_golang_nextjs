import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Courses from '@/components/Courses'
import Testimonials from '@/components/Testimonials'
import Stats from '@/components/Stats'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Courses />
      {/* <Testimonials /> */}
      {/* <Stats /> */}
      <CTA />
      <Footer />
    </main>
  )
}
