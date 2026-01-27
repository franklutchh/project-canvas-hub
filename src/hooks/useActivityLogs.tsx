import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ActivityLog {
  id: string;
  project_id: string;
  user_id: string;
  action_type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type ActionType = 
  | 'created' 
  | 'updated' 
  | 'status_changed' 
  | 'file_uploaded' 
  | 'file_deleted'
  | 'comment_added' 
  | 'requirement_added'
  | 'requirement_completed'
  | 'meeting_added';

export function useActivityLogs(projectId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch activity logs for a project
  const {
    data: activities = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['activity-logs', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!projectId,
  });

  // Create activity log mutation
  const createActivityMutation = useMutation({
    mutationFn: async ({
      project_id,
      action_type,
      description,
      metadata,
    }: {
      project_id: string;
      action_type: ActionType;
      description: string;
      metadata?: Record<string, unknown>;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('activity_logs')
        .insert([{
          project_id,
          user_id: user.id,
          action_type,
          description,
          metadata: metadata || null,
        }] as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs', projectId] });
    },
  });

  return {
    activities,
    isLoading,
    refetch,
    logActivity: createActivityMutation.mutate,
    isLogging: createActivityMutation.isPending,
  };
}

// Utility function to log activity (can be used anywhere)
export async function logProjectActivity(
  projectId: string,
  userId: string,
  actionType: ActionType,
  description: string,
  metadata?: Record<string, unknown>
) {
  const { error } = await supabase
    .from('activity_logs')
    .insert([{
      project_id: projectId,
      user_id: userId,
      action_type: actionType,
      description,
      metadata: metadata || null,
    }] as any);

  if (error) {
    console.error('Failed to log activity:', error);
  }
}
