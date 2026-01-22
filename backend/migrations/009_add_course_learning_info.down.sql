-- Remove what_you_learn and requirements columns from courses table

ALTER TABLE courses 
DROP COLUMN IF EXISTS what_you_learn,
DROP COLUMN IF EXISTS requirements;
