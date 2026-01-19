import { useState } from 'react';
import { useProject } from '@/hooks/useProjects';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, DollarSign, Calendar, Edit2, Wallet, CalendarDays } from 'lucide-react';
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
          <Button variant="glass" onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="h-4 w-4" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button variant="premium" onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Budget Card */}
        <Card className="glass-card overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
                <Wallet className="h-5 w-5 text-emerald-500" />
              </div>
              Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={budgetValue}
                    onChange={(e) => setBudgetValue(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Forma de Pagamento</Label>
                  <Input
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="Ex: 50% entrada + 50% na entrega"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Valor Total</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                    {project.budget_value
                      ? `R$ ${project.budget_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '—'}
                  </p>
                </div>
                <div className="space-y-1 pt-2 border-t border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Forma de Pagamento</p>
                  <p className="font-medium">{project.budget_payment_method || '—'}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Deadline Card */}
        <Card className="glass-card overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/70" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              Prazo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Data de Início</Label>
                  <Input
                    type="date"
                    value={deadlineStart}
                    onChange={(e) => setDeadlineStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Data de Entrega</Label>
                  <Input
                    type="date"
                    value={deadlineEnd}
                    onChange={(e) => setDeadlineEnd(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Início</p>
                  <p className="font-semibold text-lg">
                    {project.deadline_start
                      ? format(new Date(project.deadline_start), "d 'de' MMMM", { locale: ptBR })
                      : '—'}
                  </p>
                </div>
                <div className="space-y-1 pt-2 border-t border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Entrega</p>
                  <p className="font-semibold text-lg">
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
