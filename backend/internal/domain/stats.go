package domain

type DashboardStats struct {
	TotalUsers           int64 `json:"total_users"`
	TotalCourses         int64 `json:"total_courses"`
	TotalEnrollments     int64 `json:"total_enrollments"`
	PendingConsultations int64 `json:"pending_consultations"`
	TotalRevenue         int64 `json:"total_revenue"`
}

type StatsRepository interface {
	GetDashboardStats() (*DashboardStats, error)
}

type StatsUseCase interface {
	GetDashboardStats() (*DashboardStats, error)
}
