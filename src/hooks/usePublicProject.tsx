import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectRequirement, RequirementComment } from '@/types/database';

export function usePublicProject(token: string | undefined) {
  const { data: project, isLoading: projectLoading, error } = useQuery({
    queryKey: ['public-project', token],
    queryFn: async () => {
      if (!token) return null;
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('share_token', token)
        .eq('share_enabled', true)
        .single();
      
      if (error) throw error;
      return data as Project & { share_token: string; share_enabled: boolean };
    },
    enabled: !!token,
  });

  const { data: requirements = [], isLoading: requirementsLoading } = useQuery({
    queryKey: ['public-requirements', project?.id],
    queryFn: async () => {
      if (!project?.id) return [];
      const { data, error } = await supabase
        .from('project_requirements')
        .select('*')
        .eq('project_id', project.id)
        .order('order', { ascending: true });
      
      if (error) throw error;
      return data as ProjectRequirement[];
    },
    enabled: !!project?.id,
  });

  return {
    project,
    requirements,
    isLoading: projectLoading || requirementsLoading,
    error,
  };
}

export function usePublicComments(requirementId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['public-comments', requirementId],
    queryFn: async () => {
      if (!requirementId) return [];
      const { data, error } = await supabase
        .from('requirement_comments')
        .select('*')
        .eq('requirement_id', requirementId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as RequirementComment[];
    },
    enabled: !!requirementId,
  });

  const createComment = useMutation({
    mutationFn: async ({ requirementId, content, authorName }: { 
      requirementId: string; 
      content: string;
      authorName: string;
    }) => {
      const { data, error } = await supabase
        .from('requirement_comments')
        .insert([{ 
          requirement_id: requirementId, 
          content,
          author_name: authorName,
          user_id: null
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['public-comments', variables.requirementId] });
    },
  });

  return {
    comments,
    isLoading,
    createComment,
  };
}

export function useShareProject() {
  const queryClient = useQueryClient();

  const generateToken = () => {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  };

  const enableSharing = useMutation({
    mutationFn: async (projectId: string) => {
      const token = generateToken();
      const { data, error } = await supabase
        .from('projects')
        .update({ share_token: token, share_enabled: true })
        .eq('id', projectId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const disableSharing = useMutation({
    mutationFn: async (projectId: string) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ share_enabled: false })
        .eq('id', projectId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const regenerateToken = useMutation({
    mutationFn: async (projectId: string) => {
      const token = generateToken();
      const { data, error } = await supabase
        .from('projects')
        .update({ share_token: token })
        .eq('id', projectId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    enableSharing,
    disableSharing,
    regenerateToken,
  };
}
