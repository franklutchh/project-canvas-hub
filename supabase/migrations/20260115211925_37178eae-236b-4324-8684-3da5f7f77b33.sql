-- Criar tabela de tags
CREATE TABLE public.project_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, owner_id)
);

-- Criar tabela de relacionamento projeto-tag
CREATE TABLE public.project_tag_relations (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.project_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- Habilitar RLS
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tag_relations ENABLE ROW LEVEL SECURITY;

-- Policies para project_tags
CREATE POLICY "Users can view their own tags"
ON public.project_tags FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own tags"
ON public.project_tags FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own tags"
ON public.project_tags FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own tags"
ON public.project_tags FOR DELETE
USING (auth.uid() = owner_id);

-- Policies para project_tag_relations
CREATE POLICY "Users can view tag relations for their projects"
ON public.project_tag_relations FOR SELECT
USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create tag relations for their projects"
ON public.project_tag_relations FOR INSERT
WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete tag relations for their projects"
ON public.project_tag_relations FOR DELETE
USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));