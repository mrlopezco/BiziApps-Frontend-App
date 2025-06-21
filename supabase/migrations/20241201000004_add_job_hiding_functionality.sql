-- Add is_hidden column to user_job_interactions table
ALTER TABLE user_job_interactions 
ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT FALSE;

-- Add hide_hidden_jobs preference to user_profiles table (default to true to hide hidden jobs by default)
ALTER TABLE user_profiles 
ADD COLUMN hide_hidden_jobs BOOLEAN NOT NULL DEFAULT TRUE; 