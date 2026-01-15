import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ProjectTag {
  id: string;
  name: string;
  color: string;
  owner_id: string;
  created_at: string;
}

export function useTags() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tags')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as ProjectTag[];
    },
    enabled: !!user,
  });

  const createTag = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('project_tags')
        .insert({ name, color, owner_id: user.id } as any)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag criada com sucesso');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Essa tag já existe');
      } else {
        toast.error('Erro ao criar tag');
      }
    },
  });

  const deleteTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('project_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['project-tags'] });
      toast.success('Tag excluída');
    },
    onError: () => {
      toast.error('Erro ao excluir tag');
    },
  });

  return {
    tags,
    isLoading,
    createTag,
    deleteTag,
  };
}

export function useProjectTags(projectId: string) {
  const queryClient = useQueryClient();

  const { data: projectTags = [], isLoading } = useQuery({
    queryKey: ['project-tags', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tag_relations')
        .select('tag_id, project_tags(*)')
        .eq('project_id', projectId);

      if (error) throw error;
      return data.map((r: any) => r.project_tags) as ProjectTag[];
    },
    enabled: !!projectId,
  });

  const addTagToProject = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('project_tag_relations')
        .insert({ project_id: projectId, tag_id: tagId } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tags', projectId] });
    },
    onError: () => {
      toast.error('Erro ao adicionar tag');
    },
  });

  const removeTagFromProject = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('project_tag_relations')
        .delete()
        .eq('project_id', projectId)
        .eq('tag_id', tagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tags', projectId] });
    },
    onError: () => {
      toast.error('Erro ao remover tag');
    },
  });

  return {
    projectTags,
    isLoading,
    addTagToProject,
    removeTagFromProject,
  };
}

export function useAllProjectsTags(projectIds: string[]) {
  const { data: projectsTagsMap = {}, isLoading } = useQuery({
    queryKey: ['all-projects-tags', projectIds],
    queryFn: async () => {
      if (projectIds.length === 0) return {};

      const { data, error } = await supabase
        .from('project_tag_relations')
        .select('project_id, tag_id, project_tags(*)')
        .in('project_id', projectIds);

      if (error) throw error;

      const map: Record<string, ProjectTag[]> = {};
      data.forEach((r: any) => {
        if (!map[r.project_id]) map[r.project_id] = [];
        map[r.project_id].push(r.project_tags);
      });

      return map;
    },
    enabled: projectIds.length > 0,
  });

  return { projectsTagsMap, isLoading };
}
