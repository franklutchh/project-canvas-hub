import { useState } from 'react';
import { useProject } from '@/hooks/useProjects';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Palette, Edit2, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesignTabProps {
  projectId: string;
}

const colorOptions = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9',
];

export function DesignTab({ projectId }: DesignTabProps) {
  const { data: project } = useProject(projectId);
  const { updateProject } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedColor, setSelectedColor] = useState(project?.visual_identity || '#6366f1');
  const [preferences, setPreferences] = useState(project?.design_preferences || '');

  const handleSave = async () => {
    await updateProject.mutateAsync({
      id: projectId,
      visual_identity: selectedColor,
      design_preferences: preferences,
    });
    setIsEditing(false);
  };

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Color Identity */}
      <Card className="glass-card overflow-hidden">
        <div 
          className="absolute inset-x-0 top-0 h-1 transition-colors duration-300"
          style={{ backgroundColor: isEditing ? selectedColor : project.visual_identity }}
        />
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300"
              style={{ 
                backgroundColor: `${isEditing ? selectedColor : project.visual_identity}20`,
              }}
            >
              <Palette 
                className="h-5 w-5 transition-colors duration-300" 
                style={{ color: isEditing ? selectedColor : project.visual_identity }}
              />
            </div>
            Cor do Projeto
          </CardTitle>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "relative h-12 w-12 rounded-xl transition-all duration-300 hover:scale-110",
                    selectedColor === color && "ring-2 ring-offset-2 ring-offset-background scale-110"
                  )}
                  style={{ 
                    backgroundColor: color,
                    '--tw-ring-color': color,
                  } as React.CSSProperties}
                >
                  {selectedColor === color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white drop-shadow-md animate-scale-in" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-xl shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: project.visual_identity }}
              />
              <div>
                <span className="font-mono text-sm text-muted-foreground">
                  {project.visual_identity}
                </span>
                <p className="text-xs text-muted-foreground/70 mt-0.5">Cor principal do projeto</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Design Preferences */}
      <Card className="glass-card overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/50 to-primary/20" />
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            Preferências de Design
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                Descreva as preferências visuais do cliente
              </Label>
              <Textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Cores favoritas, referências visuais, estilo desejado..."
                rows={6}
              />
            </div>
          ) : (
            <div className="rounded-xl bg-muted/30 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {project.design_preferences || (
                  <span className="text-muted-foreground italic">
                    Nenhuma preferência registrada.
                  </span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end gap-3 animate-fade-in">
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
  );
}
