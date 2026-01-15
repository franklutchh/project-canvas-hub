import { Droppable } from '@hello-pangea/dnd';
import { Project, ProjectStatus, STATUS_LABELS, STATUS_COLORS, ProjectTag } from '@/types/database';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  status: ProjectStatus;
  projects: Project[];
  projectTags: Record<string, ProjectTag[]>;
}

export function KanbanColumn({ status, projects, projectTags }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-72 bg-muted/30 rounded-lg flex flex-col max-h-[calc(100vh-16rem)]">
      {/* Header */}
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded text-sm font-medium border ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </span>
          <span className="text-sm text-muted-foreground bg-background px-2 py-0.5 rounded-full">
            {projects.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 p-2 space-y-2 overflow-y-auto min-h-[100px]
              transition-colors duration-200
              ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}
            `}
          >
            {projects.map((project, index) => (
              <KanbanCard 
                key={project.id} 
                project={project} 
                index={index}
                tags={projectTags[project.id] || []}
              />
            ))}
            {provided.placeholder}
            
            {projects.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum projeto
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
