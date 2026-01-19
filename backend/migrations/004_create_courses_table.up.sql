-- Migration: 004_create_courses_table
-- Description: Create courses table for LMS courses

CREATE TYPE course_level AS ENUM ('basic', 'intermediate', 'advanced');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    original_price DECIMAL(10, 2),
    image_url TEXT,
    video_preview_url TEXT,
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0,
    level course_level DEFAULT 'basic',
    grade VARCHAR(50),
    topic VARCHAR(100),
    language VARCHAR(50) DEFAULT 'vi',
    badge VARCHAR(50),
    badge_color VARCHAR(50),
    certificate BOOLEAN DEFAULT false,
    status course_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_grade ON courses(grade);
CREATE INDEX idx_courses_topic ON courses(topic);
CREATE INDEX idx_courses_is_featured ON courses(is_featured);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE courses IS 'Courses table for MathVN LMS';
