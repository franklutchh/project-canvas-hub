import { Link } from 'react-router-dom';
import { Calendar, User, ChevronRight, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, STATUS_LABELS, STATUS_COLORS } from '@/types/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TagBadges } from './TagSelector';
import { ProjectTag } from '@/hooks/useTags';
import { getDeadlineStatus } from './DeadlineAlerts';

interface ProjectCardProps {
  project: Project;
  tags?: ProjectTag[];
}

export function ProjectCard({ project, tags = [] }: ProjectCardProps) {
  const deadlineStatus = getDeadlineStatus(project.deadline_end, project.status);

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="group relative overflow-hidden border-border/50 bg-card hover:border-border hover:shadow-lg transition-all duration-300">
        {/* Color accent bar */}
        <div 
          className="absolute left-0 top-0 h-full w-1 transition-all group-hover:w-1.5"
          style={{ backgroundColor: project.visual_identity }}
        />
        
        <CardContent className="p-5 pl-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {project.name}
                </h3>
                {deadlineStatus && (
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-[10px] px-1.5 py-0 ${
                      deadlineStatus.type === 'overdue'
                        ? 'bg-destructive/20 text-destructive border-destructive/30'
                        : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                    }`}
                  >
                    {deadlineStatus.type === 'overdue' ? (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {deadlineStatus.days === 0 ? 'Hoje' : `${deadlineStatus.days}d`}
                  </Badge>
                )}
              </div>
              
              {project.client_name && (
                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{project.client_name}</span>
                  {project.client_company && (
                    <span className="text-muted-foreground/60 truncate hidden sm:inline">• {project.client_company}</span>
                  )}
                </div>
              )}

              {tags.length > 0 && (
                <div className="mt-2">
                  <TagBadges tags={tags} />
                </div>
              )}
            </div>
            
            <Badge 
              variant="outline" 
              className={`shrink-0 ${STATUS_COLORS[project.status]}`}
            >
              {STATUS_LABELS[project.status]}
            </Badge>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(project.created_at), "d 'de' MMM", { locale: ptBR })}
              </span>
              {project.budget_value && (
                <span className="font-medium text-foreground/80">
                  R$ {project.budget_value.toLocaleString('pt-BR')}
                </span>
              )}
            </div>
            
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
