import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send, User } from 'lucide-react';
import { usePublicComments } from '@/hooks/usePublicProject';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PublicRequirementCommentsProps {
  requirementId: string;
}

export function PublicRequirementComments({ requirementId }: PublicRequirementCommentsProps) {
  const { comments, isLoading, createComment } = usePublicComments(requirementId);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !authorName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createComment.mutateAsync({
        requirementId,
        content: content.trim(),
        authorName: authorName.trim(),
      });
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pt-3 border-t border-border/50">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageCircle className="h-4 w-4" />
        <span>{comments.length} comentário(s)</span>
      </div>

      {comments.length > 0 && (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div 
              key={comment.id} 
              className="bg-muted/50 rounded-lg p-3 space-y-1"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm font-medium">
                  {comment.author_name || 'Anônimo'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(comment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              <p className="text-sm pl-8">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor={`name-${requirementId}`}>Seu nome *</Label>
          <Input
            id={`name-${requirementId}`}
            placeholder="Digite seu nome..."
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`comment-${requirementId}`}>Comentário</Label>
          <Textarea
            id={`comment-${requirementId}`}
            placeholder="Adicione um comentário ou pergunta..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || !authorName.trim() || isSubmitting}
          size="sm"
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Enviar
        </Button>
      </div>
    </div>
  );
}
