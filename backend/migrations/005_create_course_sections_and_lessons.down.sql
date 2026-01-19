-- Migration: 005_create_course_sections_and_lessons
-- Description: Drop course sections and lessons tables

DROP TRIGGER IF EXISTS update_course_lessons_updated_at ON course_lessons;
DROP TRIGGER IF EXISTS update_course_sections_updated_at ON course_sections;
DROP TABLE IF EXISTS course_lessons;
DROP TABLE IF EXISTS course_sections;
