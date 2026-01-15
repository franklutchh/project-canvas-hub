import { useState } from 'react';
import { useRequirements } from '@/hooks/useRequirements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface RequirementsTabProps {
  projectId: string;
}

export function RequirementsTab({ projectId }: RequirementsTabProps) {
  const { requirements, createRequirement, updateRequirement, deleteRequirement, toggleRequirement } = useRequirements(projectId);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await createRequirement.mutateAsync({
      project_id: projectId,
      title: newTitle,
      order: requirements.length,
    });
    setNewTitle('');
  };

  const handleUpdate = async (id: string) => {
    if (!editTitle.trim()) return;
    await updateRequirement.mutateAsync({ id, title: editTitle });
    setEditingId(null);
  };

  const completedCount = requirements.filter(r => r.completed).length;
  const progress = requirements.length > 0 ? (completedCount / requirements.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress */}
      {requirements.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{completedCount}/{requirements.length} concluídos</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Adicionar novo requisito..."
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {requirements.map((req) => (
          <div
            key={req.id}
            className="group flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition-all hover:border-border"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
            
            <Checkbox
              checked={req.completed}
              onCheckedChange={(checked) =>
                toggleRequirement.mutate({ id: req.id, completed: checked as boolean })
              }
            />

            {editingId === req.id ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => handleUpdate(req.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(req.id)}
                autoFocus
                className="flex-1"
              />
            ) : (
              <span
                onClick={() => {
                  setEditingId(req.id);
                  setEditTitle(req.title);
                }}
                className={`flex-1 cursor-text ${req.completed ? 'text-muted-foreground line-through' : ''}`}
              >
                {req.title}
              </span>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteRequirement.mutate(req.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}

        {requirements.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            Nenhum requisito adicionado ainda.
          </p>
        )}
      </div>
    </div>
  );
}
