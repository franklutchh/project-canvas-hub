import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjects } from '@/hooks/useProjects';
import { Project, ProjectStatus, STATUS_LABELS } from '@/types/database';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  client_name: z.string().optional(),
  client_email: z.string().email('Email inválido').optional().or(z.literal('')),
  client_phone: z.string().optional(),
  client_company: z.string().optional(),
  visual_identity: z.string().default('#6366f1'),
  status: z.enum(['em_conversa', 'em_desenvolvimento', 'concluido', 'pausado']),
  design_preferences: z.string().optional(),
  budget_value: z.string().optional(),
  budget_payment_method: z.string().optional(),
  deadline_start: z.string().optional(),
  deadline_end: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project;
  isEdit?: boolean;
}

const colorOptions = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9',
];

export function ProjectForm({ project, isEdit }: ProjectFormProps) {
  const navigate = useNavigate();
  const { createProject, updateProject } = useProjects();
  const [selectedColor, setSelectedColor] = useState(project?.visual_identity || '#6366f1');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      client_name: project?.client_name || '',
      client_email: project?.client_email || '',
      client_phone: project?.client_phone || '',
      client_company: project?.client_company || '',
      visual_identity: project?.visual_identity || '#6366f1',
      status: project?.status || 'em_conversa',
      design_preferences: project?.design_preferences || '',
      budget_value: project?.budget_value?.toString() || '',
      budget_payment_method: project?.budget_payment_method || '',
      deadline_start: project?.deadline_start || '',
      deadline_end: project?.deadline_end || '',
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    const projectData = {
      ...data,
      visual_identity: selectedColor,
      budget_value: data.budget_value ? parseFloat(data.budget_value) : null,
      client_email: data.client_email || null,
      client_name: data.client_name || null,
      client_phone: data.client_phone || null,
      client_company: data.client_company || null,
      design_preferences: data.design_preferences || null,
      budget_payment_method: data.budget_payment_method || null,
      deadline_start: data.deadline_start || null,
      deadline_end: data.deadline_end || null,
    };

    if (isEdit && project) {
      await updateProject.mutateAsync({ id: project.id, ...projectData });
    } else {
      await createProject.mutateAsync(projectData);
    }
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Editar Projeto' : 'Novo Projeto'}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Project Info */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Informações do Projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ex: E-commerce XYZ"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cor do Projeto</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-8 rounded-lg transition-all ${
                      selectedColor === color
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value: ProjectStatus) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="design_preferences">Preferências de Design</Label>
              <Textarea
                id="design_preferences"
                {...register('design_preferences')}
                placeholder="Cores, estilos, referências..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Nome</Label>
              <Input
                id="client_name"
                {...register('client_name')}
                placeholder="Nome do cliente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_email">Email</Label>
              <Input
                id="client_email"
                type="email"
                {...register('client_email')}
                placeholder="email@exemplo.com"
              />
              {errors.client_email && (
                <p className="text-sm text-destructive">{errors.client_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_phone">Telefone</Label>
              <Input
                id="client_phone"
                {...register('client_phone')}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_company">Empresa</Label>
              <Input
                id="client_company"
                {...register('client_company')}
                placeholder="Nome da empresa"
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget & Deadline */}
        <Card className="border-border/50 bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Orçamento e Prazo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="budget_value">Valor (R$)</Label>
                <Input
                  id="budget_value"
                  type="number"
                  step="0.01"
                  {...register('budget_value')}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_payment_method">Forma de Pagamento</Label>
                <Input
                  id="budget_payment_method"
                  {...register('budget_payment_method')}
                  placeholder="Ex: 50% entrada + 50%"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline_start">Data de Início</Label>
                <Input
                  id="deadline_start"
                  type="date"
                  {...register('deadline_start')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline_end">Data de Entrega</Label>
                <Input
                  id="deadline_end"
                  type="date"
                  {...register('deadline_end')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEdit ? 'Salvar Alterações' : 'Criar Projeto'}
        </Button>
      </div>
    </form>
  );
}
