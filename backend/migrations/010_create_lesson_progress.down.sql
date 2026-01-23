-- Remove last_lesson_id from course_enrollments
ALTER TABLE course_enrollments DROP COLUMN IF EXISTS last_lesson_id;

-- Drop lesson_progress table
DROP TABLE IF EXISTS lesson_progress;
