-- Add CV storage columns to candidate_responses table
-- Run this SQL script on your PostgreSQL database

ALTER TABLE candidate_responses 
ADD COLUMN IF NOT EXISTS cv_filename VARCHAR(255),
ADD COLUMN IF NOT EXISTS cv_file_path VARCHAR(500);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_candidate_responses_cv_filename 
ON candidate_responses(cv_filename);

-- Add comment to document the columns
COMMENT ON COLUMN candidate_responses.cv_filename IS 'Original filename of uploaded CV';
COMMENT ON COLUMN candidate_responses.cv_file_path IS 'Server path to stored CV file';
