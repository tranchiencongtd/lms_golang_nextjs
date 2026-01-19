-- Revert column drops
ALTER TABLE courses
    ADD COLUMN IF NOT EXISTS topic TEXT,
    ADD COLUMN IF NOT EXISTS language TEXT,
    ADD COLUMN IF NOT EXISTS badge TEXT,
    ADD COLUMN IF NOT EXISTS badge_color TEXT,
    ADD COLUMN IF NOT EXISTS certificate BOOLEAN DEFAULT FALSE;

-- Allow grade to be nullable again
ALTER TABLE courses
    ALTER COLUMN grade DROP NOT NULL;
