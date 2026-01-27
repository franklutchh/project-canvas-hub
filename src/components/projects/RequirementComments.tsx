import { useState } from 'react';
import { useRequirementComments } from '@/hooks/useRequirementComments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Trash2, Send, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RequirementCommentsProps {
  requirementId: string;
  projectId?: string;
}

export function RequirementComments({ requirementId, projectId }: RequirementCommentsProps) {
  const { comments, createComment, deleteComment } = useRequirementComments(requirementId, projectId);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    await createComment.mutateAsync({
      requirement_id: requirementId,
      content: newComment.trim(),
      author_name: authorName.trim() || null,
    });
    setNewComment('');
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const getInitial = (name: string | null) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/[0.06]">
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              className={cn(
                "group flex gap-3 p-4 rounded-xl",
                "bg-white/[0.03] hover:bg-white/[0.05]",
                "border border-white/[0.04] hover:border-white/[0.08]",
                "transition-all duration-300 animate-fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 border border-white/[0.08]">
                <span className="text-sm font-semibold text-primary">
                  {getInitial(comment.author_name)}
                </span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground">
                    {comment.author_name || 'Usuário'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </p>
              </div>
              
              {/* Delete Button */}
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 hover:bg-destructive/10"
                onClick={() => deleteComment.mutate(comment.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {comments.length === 0 && (
        <div className="py-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-white/[0.06]">
              <MessageCircle className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>
        </div>
      )}

      {/* New Comment Form */}
      <div className="glass-card p-4 rounded-xl border border-white/[0.06] space-y-3">
        <div className="flex gap-3">
          <Input
            placeholder="Seu nome (opcional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="max-w-[180px] bg-white/[0.03] border-white/[0.08] focus:border-primary/50 rounded-xl"
          />
        </div>
        <div className="flex gap-3">
          <Textarea
            placeholder="Escreva um comentário... (Ctrl+Enter para enviar)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[90px] resize-none bg-white/[0.03] border-white/[0.08] focus:border-primary/50 rounded-xl"
          />
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            size="icon"
            className={cn(
              "shrink-0 h-10 w-10 rounded-xl",
              "bg-primary hover:bg-primary/90",
              "shadow-glow-sm hover:shadow-glow transition-all duration-300"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
