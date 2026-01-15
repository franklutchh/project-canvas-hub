import { useParams } from 'react-router-dom';
import { usePublicProject } from '@/hooks/usePublicProject';
import { PublicRequirementComments } from '@/components/projects/PublicRequirementComments';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, CheckCircle2, Circle, ChevronDown, ExternalLink, AlertTriangle } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS } from '@/types/database';
import { useState } from 'react';

export default function PublicProjectView() {
  const { token } = useParams<{ token: string }>();
  const { project, requirements, isLoading, error } = usePublicProject(token);
  const [openRequirements, setOpenRequirements] = useState<Set<string>>(new Set());

  const toggleRequirement = (id: string) => {
    setOpenRequirements(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-semibold">Projeto não encontrado</h2>
            <p className="text-muted-foreground">
              Este link pode estar expirado ou o projeto não está mais compartilhado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedCount = requirements.filter(r => r.completed).length;
  const progress = requirements.length > 0 
    ? Math.round((completedCount / requirements.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header 
        className="border-b"
        style={{ borderBottomColor: project.visual_identity || '#6366f1' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: project.visual_identity || '#6366f1' }}
                >
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
              </div>
              {project.client_company && (
                <p className="text-muted-foreground">{project.client_company}</p>
              )}
            </div>
            <Badge className={STATUS_COLORS[project.status]}>
              {STATUS_LABELS[project.status]}
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progresso do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{completedCount} de {requirements.length} requisitos concluídos</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: project.visual_identity || '#6366f1'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Requisitos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requirements.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum requisito cadastrado ainda.
              </p>
            ) : (
              requirements.map((req) => (
                <Collapsible
                  key={req.id}
                  open={openRequirements.has(req.id)}
                  onOpenChange={() => toggleRequirement(req.id)}
                >
                  <div className="border rounded-lg p-4 space-y-3">
                    <CollapsibleTrigger className="flex items-start gap-3 w-full text-left">
                      {req.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${req.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {req.title}
                        </p>
                        {req.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {req.description}
                          </p>
                        )}
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openRequirements.has(req.id) ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <PublicRequirementComments requirementId={req.id} />
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Powered by <span className="font-medium">DevClient Pro</span>
            <ExternalLink className="h-3 w-3" />
          </p>
        </div>
      </footer>
    </div>
  );
}
