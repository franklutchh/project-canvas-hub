import { useParams } from 'react-router-dom';
import { usePublicProject } from '@/hooks/usePublicProject';
import { PublicRequirementComments } from '@/components/projects/PublicRequirementComments';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PremiumLoader } from '@/components/ui/premium-loader';
import { CheckCircle2, Circle, ChevronDown, ExternalLink, AlertTriangle, Sparkles } from 'lucide-react';
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
        {/* Background gradient */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, hsl(265 85% 60% / 0.1) 0%, transparent 50%)',
          }}
        />
        <PremiumLoader size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        {/* Background pattern */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(225 12% 15%) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <Card className="max-w-md w-full glass-premium animate-scale-in">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
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
      {/* Background effects */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(225 12% 15%) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${project.visual_identity}15 0%, transparent 50%)`,
        }}
      />
      
      {/* Header */}
      <header className="relative border-b border-white/[0.06] glass-sidebar">
        <div 
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${project.visual_identity}80, transparent)`,
          }}
        />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div 
                  className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ 
                    backgroundColor: project.visual_identity || '#6366f1',
                    boxShadow: `0 8px 32px ${project.visual_identity || '#6366f1'}40`
                  }}
                >
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  {project.client_company && (
                    <p className="text-muted-foreground">{project.client_company}</p>
                  )}
                </div>
              </div>
            </div>
            <Badge variant="glass" className={STATUS_COLORS[project.status]}>
              {STATUS_LABELS[project.status]}
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 relative">
        {/* Progress */}
        <Card className="glass-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Progresso do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{completedCount} de {requirements.length} requisitos concluídos</span>
                <span className="font-bold gradient-premium">{progress}%</span>
              </div>
              <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden relative">
                <div 
                  className="h-full transition-all duration-700 rounded-full relative"
                  style={{ 
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${project.visual_identity || '#6366f1'}, ${project.visual_identity || '#6366f1'}cc)`,
                    boxShadow: `0 0 20px ${project.visual_identity || '#6366f1'}60`
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 shimmer" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-lg">Requisitos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requirements.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum requisito cadastrado ainda.
              </p>
            ) : (
              requirements.map((req, index) => (
                <Collapsible
                  key={req.id}
                  open={openRequirements.has(req.id)}
                  onOpenChange={() => toggleRequirement(req.id)}
                >
                  <div 
                    className="glass-card rounded-xl p-4 space-y-3 animate-fade-in hover-lift"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CollapsibleTrigger className="flex items-start gap-3 w-full text-left">
                      {req.completed ? (
                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        </div>
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
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${openRequirements.has(req.id) ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="animate-fade-in">
                      <div className="pt-3 border-t border-white/[0.06]">
                        <PublicRequirementComments requirementId={req.id} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-auto relative">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Powered by 
            <span className="font-semibold gradient-premium">DevClient Pro</span>
            <ExternalLink className="h-3 w-3" />
          </p>
        </div>
      </footer>
    </div>
  );
}
