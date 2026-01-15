import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Project, ProjectStatus, ProjectTag } from '@/types/database';
import { KanbanColumn } from './KanbanColumn';
import { useProjects } from '@/hooks/useProjects';
import { toast } from '@/hooks/use-toast';

const STATUSES: ProjectStatus[] = ['em_conversa', 'em_desenvolvimento', 'concluido', 'pausado'];

interface KanbanBoardProps {
  projects: Project[];
  projectTags: Record<string, ProjectTag[]>;
}

export function KanbanBoard({ projects, projectTags }: KanbanBoardProps) {
  const { updateProject } = useProjects();

  const projectsByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = projects.filter(p => p.status === status);
    return acc;
  }, {} as Record<ProjectStatus, Project[]>);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const newStatus = destination.droppableId as ProjectStatus;
    const project = projects.find(p => p.id === draggableId);

    if (!project || project.status === newStatus) return;

    try {
      await updateProject.mutateAsync({
        id: draggableId,
        status: newStatus,
      });
    } catch (error) {
      toast({
        title: 'Erro ao mover projeto',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            projects={projectsByStatus[status]}
            projectTags={projectTags}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
