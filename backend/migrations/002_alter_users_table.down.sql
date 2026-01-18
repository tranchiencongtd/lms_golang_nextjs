-- Migration: 002_alter_users_table (down)
-- Description: Rollback - Remove phone_number column and restore last_login_at column

-- Drop phone_number index
DROP INDEX IF EXISTS idx_users_phone_number;

-- Drop phone_number column
ALTER TABLE users DROP COLUMN IF EXISTS phone_number;

-- Restore last_login_at column
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
