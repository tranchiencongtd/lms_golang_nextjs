'use client'

import { useEffect, useState } from 'react'
import { Users, DollarSign, BookOpen, MessageSquare, Loader2 } from 'lucide-react'
import { adminApi, DashboardStats } from '@/lib/api/admin'
import { formatNumber, formatPrice } from '@/lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats()
        setStats(data)
      } catch (err: any) {
        setError('Không thể tải dữ liệu thống kê')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Simple Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tổng quan</h1>
        <p className="text-gray-600 mt-1">Thống kê tổng quan hệ thống</p>
      </div>

      {/* Clean Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng học viên"
          value={formatNumber(stats?.total_users || 0)}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Doanh thu"
          value={formatPrice(stats?.total_revenue || 0)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Khóa học"
          value={formatNumber(stats?.total_courses || 0)}
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Tư vấn mới"
          value={formatNumber(stats?.pending_consultations || 0)}
          icon={MessageSquare}
          color="orange"
        />
      </div>

      {/* Simple Chart Area */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ doanh thu</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded border border-gray-200">
          <p className="text-gray-500">Biểu đồ sẽ được cập nhật</p>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color
}: {
  title: string
  value: string
  icon: any
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  )
}
