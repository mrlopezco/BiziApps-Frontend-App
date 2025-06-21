-- Create user_saved_searches table
CREATE TABLE public.user_saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Basic search parameters
  job_role VARCHAR(100),
  primary_product VARCHAR(100),
  location_country VARCHAR(100),
  job_type VARCHAR(100),
  
  -- Boolean filters
  remote BOOLEAN DEFAULT FALSE,
  has_salary BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT user_saved_searches_user_name_unique UNIQUE (user_id, name)
);

-- Create indexes for better performance
CREATE INDEX idx_user_saved_searches_user_id ON public.user_saved_searches(user_id);
CREATE INDEX idx_user_saved_searches_last_used_at ON public.user_saved_searches(last_used_at DESC);

-- Create RLS (Row Level Security) policies
ALTER TABLE public.user_saved_searches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own saved searches
CREATE POLICY "Users can view their own saved searches" ON public.user_saved_searches
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own saved searches
CREATE POLICY "Users can insert their own saved searches" ON public.user_saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own saved searches
CREATE POLICY "Users can update their own saved searches" ON public.user_saved_searches
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own saved searches
CREATE POLICY "Users can delete their own saved searches" ON public.user_saved_searches
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_saved_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_user_saved_searches_updated_at
  BEFORE UPDATE ON public.user_saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_saved_searches_updated_at(); 