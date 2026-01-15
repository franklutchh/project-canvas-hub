import { useState } from 'react';
import { useProject } from '@/hooks/useProjects';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, DollarSign, Calendar, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BudgetTabProps {
  projectId: string;
}

export function BudgetTab({ projectId }: BudgetTabProps) {
  const { data: project } = useProject(projectId);
  const { updateProject } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [budgetValue, setBudgetValue] = useState(project?.budget_value?.toString() || '');
  const [paymentMethod, setPaymentMethod] = useState(project?.budget_payment_method || '');
  const [deadlineStart, setDeadlineStart] = useState(project?.deadline_start || '');
  const [deadlineEnd, setDeadlineEnd] = useState(project?.deadline_end || '');

  const handleSave = async () => {
    await updateProject.mutateAsync({
      id: projectId,
      budget_value: budgetValue ? parseFloat(budgetValue) : null,
      budget_payment_method: paymentMethod || null,
      deadline_start: deadlineStart || null,
      deadline_end: deadlineEnd || null,
    });
    setIsEditing(false);
  };

  if (!project) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Budget */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={budgetValue}
                    onChange={(e) => setBudgetValue(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Forma de Pagamento</Label>
                  <Input
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="Ex: 50% entrada + 50% na entrega"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">
                    {project.budget_value
                      ? `R$ ${project.budget_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Forma de Pagamento</p>
                  <p className="font-medium">{project.budget_payment_method || '—'}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Deadline */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Prazo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={deadlineStart}
                    onChange={(e) => setDeadlineStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Entrega</Label>
                  <Input
                    type="date"
                    value={deadlineEnd}
                    onChange={(e) => setDeadlineEnd(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Início</p>
                  <p className="font-medium">
                    {project.deadline_start
                      ? format(new Date(project.deadline_start), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entrega</p>
                  <p className="font-medium">
                    {project.deadline_end
                      ? format(new Date(project.deadline_end), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : '—'}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
