-- Add what_you_learn and requirements columns to courses table
-- These fields store semicolon-separated values

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS what_you_learn TEXT,
ADD COLUMN IF NOT EXISTS requirements TEXT;

-- Add comments for documentation
COMMENT ON COLUMN courses.what_you_learn IS 'Semicolon-separated list of learning outcomes';
COMMENT ON COLUMN courses.requirements IS 'Semicolon-separated list of course requirements';
