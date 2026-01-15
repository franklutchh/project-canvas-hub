import { useState } from 'react';
import { useRequirementComments } from '@/hooks/useRequirementComments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Trash2, Send, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RequirementCommentsProps {
  requirementId: string;
}

export function RequirementComments({ requirementId }: RequirementCommentsProps) {
  const { comments, createComment, deleteComment } = useRequirementComments(requirementId);
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

  return (
    <div className="space-y-4 pt-3 border-t border-border/50">
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="group flex gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {comment.author_name || 'Usuário'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                onClick={() => deleteComment.mutate(comment.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* New Comment Form */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Seu nome (opcional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="max-w-[200px]"
          />
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Adicionar comentário... (Ctrl+Enter para enviar)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
