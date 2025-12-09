-- Add new questionnaire fields to candidate_responses table
-- Run this SQL script on your PostgreSQL database

-- Add portfolio_url and github_url columns
ALTER TABLE candidate_responses 
ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS github_url VARCHAR(500);

-- Create enum types for new fields if they don't exist
DO $$ BEGIN
    CREATE TYPE frontend_backend_preference AS ENUM (
        'api_calls_tutorials',
        'write_api_calls', 
        'no_backend_preference',
        'receive_data_props'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE salary_expectation_range AS ENUM (
        'ghs_1500_2000',
        'ghs_2000_2500',
        'ghs_2500_3000'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the new enum columns
ALTER TABLE candidate_responses 
ADD COLUMN IF NOT EXISTS frontend_backend frontend_backend_preference,
ADD COLUMN IF NOT EXISTS salary_expectation salary_expectation_range;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_candidate_responses_portfolio_url 
ON candidate_responses(portfolio_url);

CREATE INDEX IF NOT EXISTS idx_candidate_responses_github_url 
ON candidate_responses(github_url);

-- Add comments to document the columns
COMMENT ON COLUMN candidate_responses.portfolio_url IS 'Candidate portfolio website URL';
COMMENT ON COLUMN candidate_responses.github_url IS 'Candidate GitHub profile URL';
COMMENT ON COLUMN candidate_responses.frontend_backend IS 'Preference for frontend-backend interaction';
COMMENT ON COLUMN candidate_responses.salary_expectation IS 'Expected salary range in GHS';
