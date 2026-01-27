import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectRequirement } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { logProjectActivity } from './useActivityLogs';

export function useRequirements(projectId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requirements = [], isLoading } = useQuery({
    queryKey: ['requirements', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('project_requirements')
        .select('*')
        .eq('project_id', projectId)
        .order('order', { ascending: true });
      
      if (error) throw error;
      return data as ProjectRequirement[];
    },
    enabled: !!projectId,
  });

  const createRequirement = useMutation({
    mutationFn: async (requirement: Partial<ProjectRequirement>) => {
      const { data, error } = await supabase
        .from('project_requirements')
        .insert([requirement as any])
        .select()
        .single();
      
      if (error) throw error;
      return data as ProjectRequirement;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', projectId] });
      toast({ title: `Requisito "${data.title}" adicionado!` });
      // Log activity
      if (user && projectId) {
        logProjectActivity(projectId, user.id, 'requirement_added', `Requisito "${data.title}" adicionado`);
      }
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar requisito', description: error.message, variant: 'destructive' });
    },
  });

  const updateRequirement = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProjectRequirement> & { id: string }) => {
      const { data, error } = await supabase
        .from('project_requirements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', projectId] });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar requisito', description: error.message, variant: 'destructive' });
    },
  });

  const deleteRequirement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('project_requirements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', projectId] });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir requisito', description: error.message, variant: 'destructive' });
    },
  });

  const toggleRequirement = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('project_requirements')
        .update({ completed })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ProjectRequirement;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', projectId] });
      // Log activity
      if (user && projectId) {
        const action = data.completed ? 'concluído' : 'reaberto';
        logProjectActivity(projectId, user.id, 'requirement_completed', `Requisito "${data.title}" ${action}`, {
          completed: data.completed,
        });
      }
    },
  });

  return {
    requirements,
    isLoading,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    toggleRequirement,
  };
}
