-- Migration: 003_create_refresh_tokens_table (rollback)
-- Description: Drop refresh_tokens table

DROP TRIGGER IF EXISTS update_refresh_tokens_updated_at ON refresh_tokens;
DROP TABLE IF EXISTS refresh_tokens;
