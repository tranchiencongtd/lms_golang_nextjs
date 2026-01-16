-- Migration: 001_create_users_table (down)
-- Description: Drop users table

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS user_role;
