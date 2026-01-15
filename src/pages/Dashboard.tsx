import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectStats } from '@/components/projects/ProjectStats';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Loader2 } from 'lucide-react';
import { ProjectStatus, STATUS_LABELS } from '@/types/database';

export default function Dashboard() {
  const { projects, isLoading } = useProjects();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      project.client_company?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Gerencie seus projetos de desenvolvimento
            </p>
          </div>
          <Button asChild>
            <Link to="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <ProjectStats projects={projects} />

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por projeto ou cliente..."
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'all')}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <p className="text-muted-foreground">
              {search || statusFilter !== 'all'
                ? 'Nenhum projeto encontrado.'
                : 'Você ainda não tem projetos.'}
            </p>
            {!search && statusFilter === 'all' && (
              <Button asChild className="mt-4" variant="outline">
                <Link to="/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeiro projeto
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
