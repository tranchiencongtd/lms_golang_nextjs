-- Migration: 007_create_activation_codes_table
-- Description: Create activation codes table for course activation

CREATE TYPE activation_code_status AS ENUM ('active', 'inactive', 'expired');

CREATE TABLE IF NOT EXISTS activation_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    max_uses INTEGER DEFAULT NULL, -- NULL means unlimited
    current_uses INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL means never expires
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    note TEXT, -- Optional note for admin
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT activation_codes_max_uses_positive CHECK (max_uses IS NULL OR max_uses > 0),
    CONSTRAINT activation_codes_current_uses_valid CHECK (current_uses >= 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_activation_codes_code ON activation_codes(code);
CREATE INDEX idx_activation_codes_course_id ON activation_codes(course_id);
CREATE INDEX idx_activation_codes_is_active ON activation_codes(is_active);
CREATE INDEX idx_activation_codes_created_by ON activation_codes(created_by);
CREATE INDEX idx_activation_codes_expires_at ON activation_codes(expires_at);

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_activation_codes_updated_at
    BEFORE UPDATE ON activation_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE activation_codes IS 'Activation codes for course enrollment';
COMMENT ON COLUMN activation_codes.max_uses IS 'Maximum number of times this code can be used. NULL means unlimited.';
COMMENT ON COLUMN activation_codes.expires_at IS 'Expiration date of the code. NULL means never expires.';
