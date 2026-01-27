import { useState } from 'react';
import { useRequirements } from '@/hooks/useRequirements';
import { useCommentsCount } from '@/hooks/useRequirementComments';
import { RequirementComments } from '@/components/projects/RequirementComments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, GripVertical, MessageCircle, ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequirementsTabProps {
  projectId: string;
}

export function RequirementsTab({ projectId }: RequirementsTabProps) {
  const { requirements, createRequirement, updateRequirement, deleteRequirement, toggleRequirement } = useRequirements(projectId);
  const commentsCounts = useCommentsCount(requirements.map((r) => r.id));
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      {/* Premium Progress */}
      {requirements.length > 0 && (
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Progresso</span>
            </div>
            <span className="text-sm font-semibold text-primary">{completedCount}/{requirements.length}</span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
            {/* Shimmer effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add new - Premium */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Adicionar novo requisito..."
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="pr-4"
          />
        </div>
        <Button onClick={handleAdd} size="icon" variant="premium" className="shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* List - Premium */}
      <div className="space-y-3">
        {requirements.map((req, index) => {
          const commentsCount = commentsCounts[req.id] || 0;
          const isExpanded = expandedId === req.id;

          return (
            <Collapsible
              key={req.id}
              open={isExpanded}
              onOpenChange={(open) => setExpandedId(open ? req.id : null)}
            >
              <div
                className={cn(
                  "glass-card rounded-xl transition-all duration-300 animate-fade-in",
                  isExpanded && "ring-1 ring-primary/30 shadow-glow-sm"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="group flex items-center gap-3 p-4">
                  <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <button
                    onClick={() => toggleRequirement.mutate({ id: req.id, completed: !req.completed })}
                    className="relative flex h-5 w-5 shrink-0 items-center justify-center"
                  >
                    {req.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary animate-scale-in" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/50 hover:text-primary/70 transition-colors" />
                    )}
                  </button>

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
                      className={cn(
                        "flex-1 cursor-text transition-all duration-300",
                        req.completed && "text-muted-foreground line-through opacity-60"
                      )}
                    >
                      {req.title}
                    </span>
                  )}

                  {/* Comments toggle */}
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "gap-1.5 transition-all duration-200 rounded-lg",
                        commentsCount > 0 
                          ? "text-primary bg-primary/10 hover:bg-primary/20" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {commentsCount > 0 && (
                        <span className="text-xs font-semibold">{commentsCount}</span>
                      )}
                      <ChevronDown className={cn(
                        "h-3 w-3 transition-transform duration-300",
                        isExpanded && "rotate-180"
                      )} />
                    </Button>
                  </CollapsibleTrigger>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10"
                    onClick={() => deleteRequirement.mutate(req.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-0 border-t border-border/30">
                    <div className="pt-4">
                      <RequirementComments requirementId={req.id} projectId={projectId} />
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}

        {requirements.length === 0 && (
          <div className="glass-card rounded-2xl py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20">
                <Circle className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </div>
            <p className="text-muted-foreground">Nenhum requisito adicionado ainda.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Comece adicionando o primeiro requisito acima.</p>
          </div>
        )}
      </div>
    </div>
  );
}
