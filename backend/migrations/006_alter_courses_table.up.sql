-- Drop unused columns and constrain level/grade expectations
ALTER TABLE courses
    DROP COLUMN IF EXISTS topic,
    DROP COLUMN IF EXISTS language,
    DROP COLUMN IF EXISTS badge,
    DROP COLUMN IF EXISTS badge_color,
    DROP COLUMN IF EXISTS certificate;

-- Ensure grade exists (store as text to allow 1-12 codes)
ALTER TABLE courses
    ALTER COLUMN grade SET NOT NULL;

-- Optional: clamp existing NULL grade to '1' to keep data valid
UPDATE courses SET grade = '1' WHERE grade IS NULL;
