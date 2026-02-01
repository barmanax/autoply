-- Enable RLS on application_drafts
ALTER TABLE public.application_drafts ENABLE ROW LEVEL SECURITY;

-- Users can view drafts for their own job matches
CREATE POLICY "Users can view their own drafts"
ON public.application_drafts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.job_matches
    WHERE job_matches.id = application_drafts.job_match_id
    AND job_matches.user_id = auth.uid()
  )
);

-- Users can insert drafts for their own job matches
CREATE POLICY "Users can insert their own drafts"
ON public.application_drafts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.job_matches
    WHERE job_matches.id = application_drafts.job_match_id
    AND job_matches.user_id = auth.uid()
  )
);

-- Users can update drafts for their own job matches
CREATE POLICY "Users can update their own drafts"
ON public.application_drafts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.job_matches
    WHERE job_matches.id = application_drafts.job_match_id
    AND job_matches.user_id = auth.uid()
  )
);

-- Users can delete drafts for their own job matches
CREATE POLICY "Users can delete their own drafts"
ON public.application_drafts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.job_matches
    WHERE job_matches.id = application_drafts.job_match_id
    AND job_matches.user_id = auth.uid()
  )
);