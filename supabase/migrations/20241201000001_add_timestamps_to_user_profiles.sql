-- Add created_at and updated_at columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN created_at timestamp with time zone DEFAULT now(),
ADD COLUMN updated_at timestamp with time zone DEFAULT now();

-- Update existing records to have timestamps
UPDATE public.user_profiles 
SET created_at = now(), updated_at = now()
WHERE created_at IS NULL OR updated_at IS NULL;

-- Make the columns NOT NULL after setting default values
ALTER TABLE public.user_profiles 
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN updated_at SET NOT NULL;

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at on row updates
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 