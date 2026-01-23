-- Create lesson_progress table to track learning progress
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    watch_duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one progress record per user per lesson
    UNIQUE(user_id, lesson_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_course ON lesson_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);

-- Add last_lesson_id to course_enrollments to track where user left off
ALTER TABLE course_enrollments 
ADD COLUMN IF NOT EXISTS last_lesson_id UUID REFERENCES course_lessons(id);

COMMENT ON TABLE lesson_progress IS 'Tracks individual lesson completion status per user';
COMMENT ON COLUMN lesson_progress.is_completed IS 'Whether the lesson has been marked as completed';
COMMENT ON COLUMN lesson_progress.last_watched_at IS 'Last time the user watched this lesson';
COMMENT ON COLUMN course_enrollments.last_lesson_id IS 'The last lesson the user was watching';
