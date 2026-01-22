-- Migration: 007_create_activation_codes_table (DOWN)
-- Description: Drop activation codes table

DROP TRIGGER IF EXISTS update_activation_codes_updated_at ON activation_codes;
DROP TABLE IF EXISTS activation_codes;
DROP TYPE IF EXISTS activation_code_status;
