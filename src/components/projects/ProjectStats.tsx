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
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Em Desenvolvimento',
      value: projects.filter(p => p.status === 'em_desenvolvimento').length,
      icon: Code,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Concluídos',
      value: projects.filter(p => p.status === 'concluido').length,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Pausados',
      value: projects.filter(p => p.status === 'pausado').length,
      icon: Pause,
      gradient: 'from-zinc-500 to-slate-500',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-2xl glass-card p-5 hover-lift group animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:shadow-glow-sm transition-shadow`}>
            <stat.icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
