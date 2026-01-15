import { useState } from 'react';
import { useProject } from '@/hooks/useProjects';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Palette, Edit2 } from 'lucide-react';

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
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5" />
            Cor do Projeto
          </CardTitle>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
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
                  className={`h-10 w-10 rounded-lg transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-lg"
                style={{ backgroundColor: project.visual_identity }}
              />
              <span className="font-mono text-sm text-muted-foreground">
                {project.visual_identity}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Design Preferences */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Preferências de Design</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Label>Descreva as preferências visuais do cliente</Label>
              <Textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Cores favoritas, referências visuais, estilo desejado..."
                rows={6}
              />
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm">
              {project.design_preferences || (
                <span className="text-muted-foreground">
                  Nenhuma preferência registrada.
                </span>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end gap-2">
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
  );
}
