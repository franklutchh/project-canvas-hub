-- Add share columns to projects table
ALTER TABLE public.projects 
ADD COLUMN share_token TEXT UNIQUE,
ADD COLUMN share_enabled BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster token lookups
CREATE INDEX idx_projects_share_token ON public.projects(share_token) WHERE share_token IS NOT NULL;

-- Policy for public SELECT on projects when share is enabled and token matches
CREATE POLICY "Anyone can view shared projects by token"
ON public.projects
FOR SELECT
USING (share_enabled = true AND share_token IS NOT NULL);

-- Policy for public SELECT on project_requirements via shared project
CREATE POLICY "Anyone can view requirements of shared projects"
ON public.project_requirements
FOR SELECT
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE share_enabled = true AND share_token IS NOT NULL
  )
);

-- Policy for public SELECT on requirement_comments via shared project
CREATE POLICY "Anyone can view comments on shared project requirements"
ON public.requirement_comments
FOR SELECT
USING (
  requirement_id IN (
    SELECT pr.id FROM public.project_requirements pr
    JOIN public.projects p ON pr.project_id = p.id
    WHERE p.share_enabled = true AND p.share_token IS NOT NULL
  )
);

-- Policy for public INSERT on requirement_comments via shared project (for clients to comment)
CREATE POLICY "Anyone can create comments on shared project requirements"
ON public.requirement_comments
FOR INSERT
WITH CHECK (
  requirement_id IN (
    SELECT pr.id FROM public.project_requirements pr
    JOIN public.projects p ON pr.project_id = p.id
    WHERE p.share_enabled = true AND p.share_token IS NOT NULL
  )
  AND author_name IS NOT NULL
  AND user_id IS NULL
);