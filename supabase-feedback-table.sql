-- Create feedback table for storing user feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE SET NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('up', 'down')),
  email TEXT
);

-- Add row level security policies
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow insert for anyone (anonymous users can provide feedback)
CREATE POLICY "Allow anonymous insert to feedback" ON public.feedback
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for selecting all feedback for authenticated users
CREATE POLICY "Allow authenticated users to view all feedback" ON public.feedback
  FOR SELECT 
  USING (true);

-- Create index on roadmap_id for faster lookups
CREATE INDEX IF NOT EXISTS feedback_roadmap_id_idx ON public.feedback (roadmap_id);

-- Comment on table and columns for better documentation
COMMENT ON TABLE public.feedback IS 'Stores user feedback about generated roadmaps';
COMMENT ON COLUMN public.feedback.id IS 'Unique identifier for the feedback';
COMMENT ON COLUMN public.feedback.created_at IS 'Timestamp when feedback was submitted';
COMMENT ON COLUMN public.feedback.roadmap_id IS 'Reference to the roadmap the feedback is about, can be null if general feedback';
COMMENT ON COLUMN public.feedback.sentiment IS 'Whether the feedback is positive (up) or negative (down)';
COMMENT ON COLUMN public.feedback.email IS 'Optional email address of the user providing feedback'; 