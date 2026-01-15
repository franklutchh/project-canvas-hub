import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/database';
import { differenceInDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DeadlineAlertsProps {
  projects: Project[];
}

interface DeadlineProject {
  project: Project;
  daysRemaining: number;
  isOverdue: boolean;
}

export function DeadlineAlerts({ projects }: DeadlineAlertsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineProjects: DeadlineProject[] = projects
    .filter((p) => 
      p.deadline_end && 
      p.status !== 'concluido' && 
      p.status !== 'pausado'
    )
    .map((project) => {
      const deadline = parseISO(project.deadline_end!);
      const daysRemaining = differenceInDays(deadline, today);
      return {
        project,
        daysRemaining,
        isOverdue: daysRemaining < 0,
      };
    })
    .filter((dp) => dp.daysRemaining <= 7)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  if (deadlineProjects.length === 0) return null;

  const overdueCount = deadlineProjects.filter(dp => dp.isOverdue).length;
  const upcomingCount = deadlineProjects.filter(dp => !dp.isOverdue).length;

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Prazos Próximos</span>
          <div className="flex gap-2 ml-auto">
            {overdueCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {overdueCount} atrasado{overdueCount > 1 ? 's' : ''}
              </Badge>
            )}
            {upcomingCount > 0 && (
              <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-500">
                {upcomingCount} próximo{upcomingCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {deadlineProjects.map(({ project, daysRemaining, isOverdue }) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
              isOverdue 
                ? 'bg-destructive/10 hover:bg-destructive/20' 
                : 'bg-amber-500/10 hover:bg-amber-500/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: project.visual_identity }}
              />
              <div>
                <p className="text-sm font-medium">{project.name}</p>
                <p className="text-xs text-muted-foreground">
                  {project.client_name || 'Sem cliente'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className={`text-sm font-medium ${isOverdue ? 'text-destructive' : 'text-amber-500'}`}>
                  {isOverdue
                    ? `${Math.abs(daysRemaining)} dia${Math.abs(daysRemaining) > 1 ? 's' : ''} atrasado`
                    : daysRemaining === 0
                      ? 'Vence hoje!'
                      : `${daysRemaining} dia${daysRemaining > 1 ? 's' : ''} restante${daysRemaining > 1 ? 's' : ''}`
                  }
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  <Clock className="h-3 w-3" />
                  {format(parseISO(project.deadline_end!), "dd 'de' MMM", { locale: ptBR })}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export function getDeadlineStatus(deadlineEnd: string | null, status: string) {
  if (!deadlineEnd || status === 'concluido' || status === 'pausado') {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = parseISO(deadlineEnd);
  const daysRemaining = differenceInDays(deadline, today);

  if (daysRemaining < 0) {
    return { type: 'overdue', days: Math.abs(daysRemaining) };
  } else if (daysRemaining <= 7) {
    return { type: 'upcoming', days: daysRemaining };
  }

  return null;
}
