import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProject, useProjects } from '@/hooks/useProjects';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RequirementsTab } from '@/components/projects/tabs/RequirementsTab';
import { MeetingsTab } from '@/components/projects/tabs/MeetingsTab';
import { FilesTab } from '@/components/projects/tabs/FilesTab';
import { DesignTab } from '@/components/projects/tabs/DesignTab';
import { BudgetTab } from '@/components/projects/tabs/BudgetTab';
import { STATUS_LABELS, STATUS_COLORS, ProjectStatus } from '@/types/database';
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, Building2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(id);
  const { updateProject, deleteProject } = useProjects();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-24">
          <p className="text-muted-foreground">Projeto não encontrado.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/">Voltar ao Dashboard</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleDelete = async () => {
    await deleteProject.mutateAsync(project.id);
    navigate('/');
  };

  const handleStatusChange = async (status: ProjectStatus) => {
    await updateProject.mutateAsync({ id: project.id, status });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: project.visual_identity }}
                />
                <h1 className="text-2xl font-bold">{project.name}</h1>
              </div>
              
              {project.client_name && (
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {project.client_name}
                  </span>
                  {project.client_email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4" />
                      {project.client_email}
                    </span>
                  )}
                  {project.client_phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      {project.client_phone}
                    </span>
                  )}
                  {project.client_company && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {project.client_company}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={project.status}
              onValueChange={(value: ProjectStatus) => handleStatusChange(value)}
            >
              <SelectTrigger className="w-44">
                <Badge variant="outline" className={STATUS_COLORS[project.status]}>
                  {STATUS_LABELS[project.status]}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" asChild>
              <Link to={`/projects/${project.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todos os dados do projeto, incluindo requisitos, reuniões e arquivos, serão permanentemente excluídos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requirements" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="requirements">Requisitos</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="budget">Orçamento</TabsTrigger>
            <TabsTrigger value="files">Arquivos</TabsTrigger>
            <TabsTrigger value="meetings">Reuniões</TabsTrigger>
          </TabsList>

          <TabsContent value="requirements">
            <RequirementsTab projectId={project.id} />
          </TabsContent>

          <TabsContent value="design">
            <DesignTab projectId={project.id} />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetTab projectId={project.id} />
          </TabsContent>

          <TabsContent value="files">
            <FilesTab projectId={project.id} />
          </TabsContent>

          <TabsContent value="meetings">
            <MeetingsTab projectId={project.id} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
