import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Meeting } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { logProjectActivity } from './useActivityLogs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function useMeetings(projectId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Meeting[];
    },
    enabled: !!projectId,
  });

  const createMeeting = useMutation({
    mutationFn: async (meeting: Partial<Meeting>) => {
      const { data, error } = await supabase
        .from('meetings')
        .insert([meeting as any])
        .select()
        .single();
      
      if (error) throw error;
      return data as Meeting;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', projectId] });
      const dateStr = format(new Date(data.date), "dd 'de' MMMM", { locale: ptBR });
      toast({ title: `Reunião para ${dateStr} adicionada!` });
      // Log activity
      if (user && projectId) {
        logProjectActivity(projectId, user.id, 'meeting_added', `Reunião agendada para ${dateStr}`);
      }
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar reunião', description: error.message, variant: 'destructive' });
    },
  });

  const updateMeeting = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Meeting> & { id: string }) => {
      const { data, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', projectId] });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar reunião', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMeeting = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', projectId] });
      toast({ title: 'Reunião removida!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir reunião', description: error.message, variant: 'destructive' });
    },
  });

  return {
    meetings,
    isLoading,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  };
}
