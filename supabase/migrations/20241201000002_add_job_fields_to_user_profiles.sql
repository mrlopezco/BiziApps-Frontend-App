-- Add job_role and primary_product fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN job_roles jsonb DEFAULT '[]'::jsonb,
ADD COLUMN primary_products jsonb DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.job_roles IS 'Array of job roles the user specializes in (e.g., ["consultant", "project_manager", "developer"])';
COMMENT ON COLUMN public.user_profiles.primary_products IS 'Array of primary products the user works with (e.g., ["power_apps", "dynamics_365_bc", "microsoft_365"])'; 