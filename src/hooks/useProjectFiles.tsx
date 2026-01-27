import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectFile } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { logProjectActivity } from './useActivityLogs';

export function useProjectFiles(projectId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['project-files', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProjectFile[];
    },
    enabled: !!projectId,
  });

  const uploadFile = useMutation({
    mutationFn: async ({ file, projectId }: { file: File; projectId: string }) => {
      const fileName = `${projectId}/${Date.now()}_${file.name}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(fileName);

      // Save file record
      const { data, error } = await supabase
        .from('project_files')
        .insert({
          project_id: projectId,
          name: file.name,
          url: urlData.publicUrl,
          type: file.type,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
      toast({ title: `Arquivo "${data.name}" enviado!` });
      // Log activity
      if (user && projectId) {
        logProjectActivity(projectId, user.id, 'file_uploaded', `Arquivo "${data.name}" enviado`, {
          file_name: data.name,
          file_type: data.type,
        });
      }
    },
    onError: (error) => {
      toast({ title: 'Erro ao enviar arquivo', description: error.message, variant: 'destructive' });
    },
  });

  const deleteFile = useMutation({
    mutationFn: async ({ id, url, name }: { id: string; url: string; name: string }) => {
      // Extract file path from URL
      const urlParts = url.split('/project-files/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('project-files').remove([filePath]);
      }

      const { error } = await supabase
        .from('project_files')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { name };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
      toast({ title: `Arquivo "${data.name}" removido!` });
      // Log activity
      if (user && projectId) {
        logProjectActivity(projectId, user.id, 'file_deleted', `Arquivo "${data.name}" removido`, {
          file_name: data.name,
        });
      }
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir arquivo', description: error.message, variant: 'destructive' });
    },
  });

  return {
    files,
    isLoading,
    uploadFile,
    deleteFile,
  };
}
