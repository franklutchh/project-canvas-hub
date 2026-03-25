import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGeneratePRD } from '@/hooks/useGeneratePRD';
import { useRequirements } from '@/hooks/useRequirements';
import { useMeetings } from '@/hooks/useMeetings';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { useProjectTags } from '@/hooks/useTags';
import { Sparkles, Copy, RefreshCw, FileText } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface GeneratePRDDialogProps {
  project: any;
}

export function GeneratePRDDialog({ project }: GeneratePRDDialogProps) {
  const [open, setOpen] = useState(false);
  const { content, status, generate, reset } = useGeneratePRD();
  const { requirements } = useRequirements(project.id);
  const { meetings } = useMeetings(project.id);
  const { files } = useProjectFiles(project.id);
  const { projectTags } = useProjectTags(project.id);

  const handleGenerate = () => {
    generate({
      project,
      requirements,
      meetings,
      files,
      tags: projectTags,
    });
  };

  const handleOpen = () => {
    setOpen(true);
    if (status === 'idle') {
      handleGenerate();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success('PRD copiado para a área de transferência!');
  };

  const handleRegenerate = () => {
    reset();
    handleGenerate();
  };

  return (
    <>
      <Button
        variant="glow"
        size="icon"
        onClick={handleOpen}
        title="Gerar PRD com IA"
        className="rounded-xl"
      >
        <Sparkles className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="glass-premium max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg">PRD — {project.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {status === 'generating' ? 'Gerando documento...' : status === 'done' ? 'Documento gerado' : 'Preparando...'}
                  </p>
                </div>
              </div>
              {status === 'done' && (
                <div className="flex gap-2">
                  <Button variant="glass" size="sm" onClick={handleCopy} className="gap-1.5 rounded-lg">
                    <Copy className="h-3.5 w-3.5" />
                    Copiar
                  </Button>
                  <Button variant="glass" size="sm" onClick={handleRegenerate} className="gap-1.5 rounded-lg">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regerar
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            {status === 'generating' && !content && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-ping" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Analisando projeto...</p>
                  <p className="text-sm text-muted-foreground mt-1">A IA está analisando requisitos, design, orçamento e reuniões</p>
                </div>
              </div>
            )}

            {content && (
              <div className={cn(
                "prose prose-invert max-w-none",
                "prose-headings:text-foreground prose-p:text-foreground/90",
                "prose-strong:text-foreground prose-li:text-foreground/90",
                "prose-h1:text-2xl prose-h1:font-bold prose-h1:border-b prose-h1:border-border/30 prose-h1:pb-3 prose-h1:mb-4",
                "prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-3",
                "prose-h3:text-lg prose-h3:font-medium prose-h3:mt-6",
                "prose-table:border prose-table:border-border/30",
                "prose-th:bg-muted/20 prose-th:px-4 prose-th:py-2 prose-th:text-left",
                "prose-td:px-4 prose-td:py-2 prose-td:border-t prose-td:border-border/20",
                status === 'generating' && "after:content-['▊'] after:animate-pulse after:text-primary"
              )}>
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}

            {status === 'error' && !content && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <p className="text-destructive font-medium">Erro ao gerar PRD</p>
                <Button variant="glass" onClick={handleRegenerate} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
