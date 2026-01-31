-- Add unique constraint on resumes.user_id for upsert support
ALTER TABLE public.resumes 
ADD CONSTRAINT resumes_user_id_unique UNIQUE (user_id);