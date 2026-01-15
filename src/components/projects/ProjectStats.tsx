import { Project } from '@/types/database';
import { MessageSquare, Code, CheckCircle, Pause } from 'lucide-react';

interface ProjectStatsProps {
  projects: Project[];
}

export function ProjectStats({ projects }: ProjectStatsProps) {
  const stats = [
    {
      label: 'Em Conversa',
      value: projects.filter(p => p.status === 'em_conversa').length,
      icon: MessageSquare,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Em Desenvolvimento',
      value: projects.filter(p => p.status === 'em_desenvolvimento').length,
      icon: Code,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Concluídos',
      value: projects.filter(p => p.status === 'concluido').length,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Pausados',
      value: projects.filter(p => p.status === 'pausado').length,
      icon: Pause,
      color: 'text-zinc-400',
      bg: 'bg-zinc-500/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
