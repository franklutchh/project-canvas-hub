import { useParams } from 'react-router-dom';
import { useProject } from '@/hooks/useProjects';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Loader2 } from 'lucide-react';

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-24">
          <p className="text-muted-foreground">Projeto não encontrado.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ProjectForm project={project} isEdit />
    </AppLayout>
  );
}
