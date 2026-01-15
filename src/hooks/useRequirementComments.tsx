import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RequirementComment } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export function useRequirementComments(requirementId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['requirement-comments', requirementId],
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
    mutationFn: async (comment: { requirement_id: string; content: string; author_name?: string }) => {
      const { data, error } = await supabase
        .from('requirement_comments')
        .insert([comment as any])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirement-comments', requirementId] });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar comentário', description: error.message, variant: 'destructive' });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('requirement_comments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirement-comments', requirementId] });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir comentário', description: error.message, variant: 'destructive' });
    },
  });

  return {
    comments,
    isLoading,
    createComment,
    deleteComment,
  };
}

export function useCommentsCount(requirementIds: string[]) {
  const { data: counts = {} } = useQuery({
    queryKey: ['requirement-comments-count', requirementIds],
    queryFn: async () => {
      if (!requirementIds.length) return {};
      
      const { data, error } = await supabase
        .from('requirement_comments')
        .select('requirement_id')
        .in('requirement_id', requirementIds);
      
      if (error) throw error;
      
      const countMap: Record<string, number> = {};
      data.forEach((item) => {
        countMap[item.requirement_id] = (countMap[item.requirement_id] || 0) + 1;
      });
      return countMap;
    },
    enabled: requirementIds.length > 0,
  });

  return counts;
}
