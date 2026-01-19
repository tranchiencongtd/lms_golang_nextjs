-- Migration: 004_create_courses_table
-- Description: Drop courses table

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
DROP TABLE IF EXISTS courses;
DROP TYPE IF EXISTS course_level;
DROP TYPE IF EXISTS course_status;
