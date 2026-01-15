
-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  phone TEXT,
  default_payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create requirement_comments table
CREATE TABLE public.requirement_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID NOT NULL REFERENCES public.project_requirements(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.requirement_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for requirement_comments (follows project ownership)
CREATE POLICY "Users can view comments on their project requirements"
ON public.requirement_comments FOR SELECT
USING (requirement_id IN (
  SELECT pr.id FROM public.project_requirements pr
  JOIN public.projects p ON pr.project_id = p.id
  WHERE p.owner_id = auth.uid()
));

CREATE POLICY "Users can create comments on their project requirements"
ON public.requirement_comments FOR INSERT
WITH CHECK (requirement_id IN (
  SELECT pr.id FROM public.project_requirements pr
  JOIN public.projects p ON pr.project_id = p.id
  WHERE p.owner_id = auth.uid()
));

CREATE POLICY "Users can delete comments on their project requirements"
ON public.requirement_comments FOR DELETE
USING (requirement_id IN (
  SELECT pr.id FROM public.project_requirements pr
  JOIN public.projects p ON pr.project_id = p.id
  WHERE p.owner_id = auth.uid()
));
