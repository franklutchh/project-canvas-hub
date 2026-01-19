import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Check, RefreshCw, Link, Globe } from 'lucide-react';
import { useShareProject } from '@/hooks/usePublicProject';
import { toast } from '@/hooks/use-toast';

interface ShareProjectDialogProps {
  projectId: string;
  shareToken: string | null;
  shareEnabled: boolean;
}

export function ShareProjectDialog({ projectId, shareToken, shareEnabled }: ShareProjectDialogProps) {
  const [copied, setCopied] = useState(false);
  const { enableSharing, disableSharing, regenerateToken } = useShareProject();

  const shareUrl = shareToken 
    ? `${window.location.origin}/share/${shareToken}` 
    : '';

  const handleToggleShare = async (enabled: boolean) => {
    if (enabled) {
      await enableSharing.mutateAsync(projectId);
      toast({ title: 'Link de compartilhamento ativado!' });
    } else {
      await disableSharing.mutateAsync(projectId);
      toast({ title: 'Link de compartilhamento desativado.' });
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: 'Link copiado!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateToken = async () => {
    await regenerateToken.mutateAsync(projectId);
    toast({ title: 'Novo link gerado!' });
  };

  const isLoading = enableSharing.isPending || disableSharing.isPending || regenerateToken.isPending;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="glass" size="sm" className="gap-2 rounded-xl">
          <Share2 className="h-4 w-4" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass-premium border-white/[0.1]">
        {/* Top accent */}
        <div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(265 85% 60% / 0.5), transparent)',
          }}
        />
        
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <Link className="h-4 w-4 text-primary" />
            </div>
            Compartilhar Projeto
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Toggle Section */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${shareEnabled ? 'bg-primary/20' : 'bg-white/[0.05]'}`}>
                <Globe className={`h-5 w-5 transition-colors ${shareEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="share-toggle" className="font-medium">Link público</Label>
                <p className="text-sm text-muted-foreground">
                  Clientes podem ver e comentar
                </p>
              </div>
            </div>
            <Switch
              id="share-toggle"
              checked={shareEnabled}
              onCheckedChange={handleToggleShare}
              disabled={isLoading}
            />
          </div>

          {shareEnabled && shareToken && (
            <div className="space-y-4 animate-fade-in">
              <Label className="text-sm font-medium">Link de compartilhamento</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="bg-white/[0.03] border-white/[0.1] text-sm"
                />
                <Button
                  variant="glass"
                  size="icon"
                  onClick={handleCopyLink}
                  disabled={isLoading}
                  className="shrink-0 rounded-xl"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerateToken}
                disabled={isLoading}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Gerar novo link
              </Button>
              
              <p className="text-xs text-muted-foreground bg-white/[0.03] p-3 rounded-lg border border-white/[0.06]">
                ⚠️ Gerar um novo link invalidará o link anterior.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
