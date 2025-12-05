-- Add status columns to candidate_responses table
ALTER TABLE candidate_responses 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_candidate_responses_is_read ON candidate_responses(is_read);
CREATE INDEX IF NOT EXISTS idx_candidate_responses_is_starred ON candidate_responses(is_starred);
CREATE INDEX IF NOT EXISTS idx_candidate_responses_is_archived ON candidate_responses(is_archived);

-- Update existing records to have default values
UPDATE candidate_responses 
SET 
  is_read = FALSE,
  is_starred = FALSE,
  is_archived = FALSE
WHERE 
  is_read IS NULL 
  OR is_starred IS NULL 
  OR is_archived IS NULL;
