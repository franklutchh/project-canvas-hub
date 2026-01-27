import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  Edit,
  RefreshCw,
  Upload,
  Trash2,
  MessageSquare,
  CheckCircle2,
  Calendar,
  FileText,
  User,
} from 'lucide-react';
import { ActivityLog } from '@/hooks/useActivityLogs';
import { cn } from '@/lib/utils';

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'created':
      return <Plus className="h-3.5 w-3.5" />;
    case 'updated':
      return <Edit className="h-3.5 w-3.5" />;
    case 'status_changed':
      return <RefreshCw className="h-3.5 w-3.5" />;
    case 'file_uploaded':
      return <Upload className="h-3.5 w-3.5" />;
    case 'file_deleted':
      return <Trash2 className="h-3.5 w-3.5" />;
    case 'comment_added':
      return <MessageSquare className="h-3.5 w-3.5" />;
    case 'requirement_added':
      return <FileText className="h-3.5 w-3.5" />;
    case 'requirement_completed':
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case 'meeting_added':
      return <Calendar className="h-3.5 w-3.5" />;
    default:
      return <Edit className="h-3.5 w-3.5" />;
  }
};

const getActionColor = (actionType: string) => {
  switch (actionType) {
    case 'created':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'updated':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'status_changed':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'file_uploaded':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'file_deleted':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'comment_added':
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'requirement_added':
      return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    case 'requirement_completed':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'meeting_added':
      return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    default:
      return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  }
};

interface ActivityTimelineProps {
  activities: ActivityLog[];
  isLoading?: boolean;
}

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="relative flex flex-col items-center">
              <div className="h-8 w-8 rounded-full skeleton-shimmer" />
              {i < 4 && <div className="w-0.5 h-16 skeleton-shimmer mt-2" />}
            </div>
            <div className="flex-1 pb-4">
              <div className="h-4 w-48 rounded skeleton-shimmer mb-2" />
              <div className="h-3 w-24 rounded skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="h-16 w-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground text-center">
          Nenhuma atividade registrada
        </p>
        <p className="text-xs text-muted-foreground/70 text-center mt-1">
          As atividades do projeto aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-white/[0.1] to-transparent" />

      <div className="space-y-1">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="relative flex gap-4 pl-0 animate-fade-in"
            style={{ animationDelay: `${index * 30}ms` } as React.CSSProperties}
          >
            {/* Icon node */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center border",
                  "transition-all duration-300 hover:scale-110",
                  getActionColor(activity.action_type)
                )}
              >
                {getActionIcon(activity.action_type)}
              </div>
            </div>

            {/* Content card */}
            <div className="flex-1 pb-6 -mt-1">
              <div className="glass-card rounded-xl p-3 hover:bg-white/[0.03] transition-colors">
                <p className="text-sm text-foreground leading-relaxed">
                  {activity.description}
                </p>
                
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/[0.06]">
                    {activity.metadata.old_status && activity.metadata.new_status && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.05]">
                          {String(activity.metadata.old_status)}
                        </span>
                        <span>→</span>
                        <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                          {String(activity.metadata.new_status)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                    <User className="h-3 w-3" />
                    <span>Você</span>
                  </div>
                  <span className="text-xs text-muted-foreground/50">•</span>
                  <span className="text-xs text-muted-foreground/70">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
