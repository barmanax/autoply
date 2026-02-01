-- Enable RLS on resumes and preferences tables
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;

-- Resumes policies
CREATE POLICY "Users can view their own resumes"
ON public.resumes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
ON public.resumes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
ON public.resumes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
ON public.resumes FOR DELETE
USING (auth.uid() = user_id);

-- Preferences policies
CREATE POLICY "Users can view their own preferences"
ON public.preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
ON public.preferences FOR DELETE
USING (auth.uid() = user_id);