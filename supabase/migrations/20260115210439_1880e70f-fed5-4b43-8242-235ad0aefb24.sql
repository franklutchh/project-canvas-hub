-- Enum para status do projeto
CREATE TYPE public.project_status AS ENUM ('em_conversa', 'em_desenvolvimento', 'concluido', 'pausado');

-- Tabela de projetos
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  client_company TEXT,
  visual_identity TEXT DEFAULT '#6366f1',
  status project_status NOT NULL DEFAULT 'em_conversa',
  design_preferences TEXT,
  budget_value DECIMAL(12,2),
  budget_payment_method TEXT,
  deadline_start DATE,
  deadline_end DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de requisitos do projeto
CREATE TABLE public.project_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de reuniões
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de arquivos do projeto
CREATE TABLE public.project_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS em todas as tabelas
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies para projects
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies para project_requirements
CREATE POLICY "Users can view requirements of their projects"
  ON public.project_requirements FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create requirements for their projects"
  ON public.project_requirements FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update requirements of their projects"
  ON public.project_requirements FOR UPDATE
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete requirements of their projects"
  ON public.project_requirements FOR DELETE
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

-- RLS Policies para meetings
CREATE POLICY "Users can view meetings of their projects"
  ON public.meetings FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create meetings for their projects"
  ON public.meetings FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update meetings of their projects"
  ON public.meetings FOR UPDATE
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete meetings of their projects"
  ON public.meetings FOR DELETE
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

-- RLS Policies para project_files
CREATE POLICY "Users can view files of their projects"
  ON public.project_files FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create files for their projects"
  ON public.project_files FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update files of their projects"
  ON public.project_files FOR UPDATE
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete files of their projects"
  ON public.project_files FOR DELETE
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

-- Storage bucket para arquivos dos projetos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', false);

-- Storage policies
CREATE POLICY "Users can view their project files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-files' 
    AND (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload files to their projects"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files' 
    AND (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'project-files' 
    AND (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their project files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-files' 
    AND (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
    )
  );