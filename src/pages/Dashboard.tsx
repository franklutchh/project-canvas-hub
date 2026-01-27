import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useTags, useAllProjectsTags } from '@/hooks/useTags';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectStats } from '@/components/projects/ProjectStats';
import { DeadlineAlerts } from '@/components/projects/DeadlineAlerts';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { SkeletonCardGrid } from '@/components/ui/skeleton-card';
import { SkeletonStats } from '@/components/ui/skeleton-stats';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus, Search, Tag, X, LayoutGrid, Columns, Sparkles } from 'lucide-react';
import { ProjectStatus, STATUS_LABELS } from '@/types/database';

export default function Dashboard() {
  const { projects, isLoading } = useProjects();
  const { tags } = useTags();
  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);
  const { projectsTagsMap } = useAllProjectsTags(projectIds);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>(() => {
    return (localStorage.getItem('dashboard-view-mode') as 'grid' | 'kanban') || 'grid';
  });

  useEffect(() => {
    localStorage.setItem('dashboard-view-mode', viewMode);
  }, [viewMode]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      project.client_company?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    const matchesTags = selectedTagIds.length === 0 || 
      (projectsTagsMap[project.id] && 
        selectedTagIds.some(tagId => projectsTagsMap[project.id].some(t => t.id === tagId)));
    
    return matchesSearch && matchesStatus && matchesTags;
  });

  const selectedTags = tags.filter(t => selectedTagIds.includes(t.id));

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
              <Sparkles className="h-5 w-5 text-primary animate-pulse-glow" />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gerencie seus projetos de desenvolvimento
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(value) => value && setViewMode(value as 'grid' | 'kanban')}
              className="hidden sm:flex glass-card rounded-xl p-1"
            >
              <ToggleGroupItem 
                value="grid" 
                aria-label="Grade" 
                className="gap-1.5 rounded-lg data-[state=on]:bg-white/[0.1] data-[state=on]:shadow-sm"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden md:inline">Grade</span>
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="kanban" 
                aria-label="Kanban" 
                className="gap-1.5 rounded-lg data-[state=on]:bg-white/[0.1] data-[state=on]:shadow-sm"
              >
                <Columns className="h-4 w-4" />
                <span className="hidden md:inline">Kanban</span>
              </ToggleGroupItem>
            </ToggleGroup>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Projeto
              </Link>
            </Button>
          </div>
        </div>

        {/* Loading State with Skeletons */}
        {isLoading ? (
          <>
            <SkeletonStats />
            <SkeletonCardGrid count={6} />
          </>
        ) : (
          <>
            {/* Deadline Alerts */}
            <DeadlineAlerts projects={projects} />

            {/* Stats */}
            <ProjectStats projects={projects} />

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por projeto ou cliente..."
                  className="pl-11"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'all')}
                >
                  <SelectTrigger className="w-full sm:w-44 bg-white/[0.03] border-white/[0.1]">
                    <SelectValue placeholder="Status" />
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

                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`gap-2 ${selectedTagIds.length > 0 ? 'border-primary/50 bg-primary/10' : ''}`}
                    >
                      <Tag className="h-4 w-4" />
                      <span className="hidden sm:inline">Tags</span>
                      {selectedTagIds.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center rounded-full">
                          {selectedTagIds.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4 glass-premium" align="end">
                    <p className="text-sm font-medium mb-3">Filtrar por Tags</p>
                    {tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => {
                          const isSelected = selectedTagIds.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag.id)}
                              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition-all border ${
                                isSelected ? 'ring-2 ring-primary/50 shadow-glow-sm' : ''
                              }`}
                              style={{
                                backgroundColor: `${tag.color}20`,
                                borderColor: `${tag.color}50`,
                                color: tag.color,
                              }}
                            >
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma tag criada ainda.</p>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Active Tag Filters */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 animate-fade-in">
                <span className="text-xs text-muted-foreground">Filtrando por:</span>
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="gap-1.5 pr-1.5 rounded-full"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      borderColor: `${tag.color}50`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                    <button
                      onClick={() => toggleTag(tag.id)}
                      className="ml-1 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedTagIds([])}
                >
                  Limpar filtros
                </Button>
              </div>
            )}

            {/* Projects */}
            {filteredProjects.length > 0 ? (
              viewMode === 'kanban' ? (
                <KanbanBoard 
                  projects={filteredProjects} 
                  projectTags={projectsTagsMap}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProjects.map((project, index) => (
                    <div 
                      key={project.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                    >
                      <ProjectCard 
                        project={project} 
                        tags={projectsTagsMap[project.id] || []}
                      />
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl glass-card py-20 px-4">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">
                  {search || statusFilter !== 'all' || selectedTagIds.length > 0
                    ? 'Nenhum projeto encontrado com esses filtros.'
                    : 'Você ainda não tem projetos.'}
                </p>
                {!search && statusFilter === 'all' && selectedTagIds.length === 0 && (
                  <Button asChild className="mt-6" variant="outline">
                    <Link to="/projects/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar primeiro projeto
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
