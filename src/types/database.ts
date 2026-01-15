export type ProjectStatus = 'em_conversa' | 'em_desenvolvimento' | 'concluido' | 'pausado';

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_company: string | null;
  visual_identity: string;
  status: ProjectStatus;
  design_preferences: string | null;
  budget_value: number | null;
  budget_payment_method: string | null;
  deadline_start: string | null;
  deadline_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectRequirement {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  order: number;
  created_at: string;
}

export interface Meeting {
  id: string;
  project_id: string;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  url: string;
  type: string | null;
  created_at: string;
}

export interface ProjectTag {
  id: string;
  name: string;
  color: string;
  owner_id: string;
  created_at: string;
}

export interface ProjectTagRelation {
  project_id: string;
  tag_id: string;
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  em_conversa: 'Em Conversa',
  em_desenvolvimento: 'Em Desenvolvimento',
  concluido: 'Concluído',
  pausado: 'Pausado',
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  em_conversa: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  em_desenvolvimento: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  concluido: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pausado: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};
