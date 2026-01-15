import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Check, RefreshCw, Link } from 'lucide-react';
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
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Compartilhar Projeto
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="share-toggle">Link público</Label>
              <p className="text-sm text-muted-foreground">
                Clientes podem ver detalhes e comentar
              </p>
            </div>
            <Switch
              id="share-toggle"
              checked={shareEnabled}
              onCheckedChange={handleToggleShare}
              disabled={isLoading}
            />
          </div>

          {shareEnabled && shareToken && (
            <div className="space-y-3">
              <Label>Link de compartilhamento</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  disabled={isLoading}
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
                className="gap-2 text-muted-foreground"
              >
                <RefreshCw className="h-4 w-4" />
                Gerar novo link
              </Button>
              
              <p className="text-xs text-muted-foreground">
                Gerar um novo link invalidará o link anterior.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
