-- Migration: 008_create_course_enrollments_table (DOWN)
-- Description: Drop course enrollments table

DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON course_enrollments;
DROP TABLE IF EXISTS course_enrollments;
DROP TYPE IF EXISTS enrollment_status;
