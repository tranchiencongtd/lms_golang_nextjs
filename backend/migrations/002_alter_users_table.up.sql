-- Migration: 002_alter_users_table
-- Description: Add phone_number column and remove last_login_at column

-- Add phone_number column with unique constraint
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) NOT NULL UNIQUE;

-- Create index for phone_number
CREATE INDEX idx_users_phone_number ON users(phone_number);

-- Drop last_login_at column
ALTER TABLE users DROP COLUMN IF EXISTS last_login_at;

-- Add comment
COMMENT ON COLUMN users.phone_number IS 'User phone number for authentication (optional)';
