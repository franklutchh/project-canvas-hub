import { Draggable } from '@hello-pangea/dnd';
import { Project } from '@/types/database';
import { Calendar, Building2 } from 'lucide-react';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ProjectTag } from '@/types/database';

interface KanbanCardProps {
  project: Project;
  index: number;
  tags?: ProjectTag[];
}

export function KanbanCard({ project, index, tags = [] }: KanbanCardProps) {
  const navigate = useNavigate();

  const getDeadlineBadge = () => {
    if (!project.deadline_end) return null;
    
    const endDate = new Date(project.deadline_end);
    const today = new Date();
    
    if (isPast(endDate)) {
      return (
        <Badge variant="destructive" className="text-xs">
          Atrasado
        </Badge>
      );
    }
    
    if (isWithinInterval(today, { start: today, end: addDays(today, 7) })) {
      return (
        <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-500 bg-amber-500/10">
          Prazo próximo
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <Draggable draggableId={project.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => navigate(`/projects/${project.id}`)}
          className={`
            glass-card rounded-xl p-4 cursor-pointer
            transition-all duration-300 hover:border-primary/30
            ${snapshot.isDragging ? 'shadow-premium ring-2 ring-primary/30 rotate-2 scale-105' : ''}
          `}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg"
                style={{ 
                  backgroundColor: project.visual_identity || '#6366f1',
                  boxShadow: `0 4px 12px ${project.visual_identity || '#6366f1'}40`
                }}
              >
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm truncate">{project.name}</h4>
                {project.client_name && (
                  <p className="text-xs text-muted-foreground truncate">
                    {project.client_name}
                  </p>
                )}
              </div>
            </div>

            {/* Company */}
            {project.client_company && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{project.client_company}</span>
              </div>
            )}

            {/* Deadline */}
            {project.deadline_end && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(project.deadline_end), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
                {getDeadlineBadge()}
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: `${tag.color}20`,
                      color: tag.color
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
                {tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{tags.length - 2}</span>
                )}
              </div>
            )}

            {/* Budget */}
            {project.budget_value && (
              <p className="text-xs font-medium text-emerald-400">
                R$ {project.budget_value.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
