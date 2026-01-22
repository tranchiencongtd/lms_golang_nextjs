-- Migration: 008_create_course_enrollments_table
-- Description: Create course enrollments table for tracking user course access

CREATE TYPE enrollment_status AS ENUM ('active', 'expired', 'cancelled');

CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    activation_code_id UUID REFERENCES activation_codes(id) ON DELETE SET NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL means never expires
    status enrollment_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint: one user can only enroll once per course
    CONSTRAINT course_enrollments_user_course_unique UNIQUE (user_id, course_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX idx_course_enrollments_activation_code_id ON course_enrollments(activation_code_id);
CREATE INDEX idx_course_enrollments_enrolled_at ON course_enrollments(enrolled_at DESC);

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_course_enrollments_updated_at
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE course_enrollments IS 'Course enrollments tracking user access to courses';
COMMENT ON COLUMN course_enrollments.expires_at IS 'Enrollment expiration date. NULL means lifetime access.';
