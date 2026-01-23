'use client'

import AdminGuard from '@/components/admin/AdminGuard'
import Sidebar from '@/components/admin/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
