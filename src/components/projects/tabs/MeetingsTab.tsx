import { useState } from 'react';
import { useMeetings } from '@/hooks/useMeetings';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Trash2, Calendar, Edit2, Check, X, Video, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MeetingsTabProps {
  projectId: string;
}

export function MeetingsTab({ projectId }: MeetingsTabProps) {
  const { meetings, createMeeting, updateMeeting, deleteMeeting } = useMeetings(projectId);
  const [isAdding, setIsAdding] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const handleAdd = async () => {
    if (!newDate || !newNotes.trim()) return;
    await createMeeting.mutateAsync({
      project_id: projectId,
      date: new Date(newDate).toISOString(),
      notes: newNotes,
    });
    setNewDate('');
    setNewNotes('');
    setIsAdding(false);
  };

  const handleUpdate = async (id: string) => {
    await updateMeeting.mutateAsync({ id, notes: editNotes });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {!isAdding ? (
        <Button 
          onClick={() => setIsAdding(true)} 
          variant="glass" 
          className="w-full gap-2 py-6 border-dashed hover:border-primary/50"
        >
          <Plus className="h-4 w-4" />
          Nova Reunião
        </Button>
      ) : (
        <Card className="glass-card border-primary/30 overflow-hidden animate-fade-in">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/70" />
          <CardContent className="space-y-4 pt-6">
            <Input
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <Textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Anotações da reunião..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
              <Button variant="premium" onClick={handleAdd}>Salvar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {meetings.map((meeting, index) => (
          <Card 
            key={meeting.id} 
            className={cn(
              "glass-card group transition-all duration-300 animate-fade-in",
              editingId === meeting.id && "ring-1 ring-primary/30"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {format(new Date(meeting.date), "d 'de' MMMM", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    às {format(new Date(meeting.date), "HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingId === meeting.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUpdate(meeting.id)}
                      className="h-8 w-8 hover:bg-emerald-500/10"
                    >
                      <Check className="h-4 w-4 text-emerald-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(null)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingId(meeting.id);
                        setEditNotes(meeting.notes || '');
                      }}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMeeting.mutate(meeting.id)}
                      className="h-8 w-8 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {editingId === meeting.id ? (
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                  autoFocus
                />
              ) : (
                <div className="flex gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{meeting.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {meetings.length === 0 && !isAdding && (
          <div className="glass-card rounded-2xl py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20">
                <Video className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </div>
            <p className="text-muted-foreground">Nenhuma reunião registrada.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Registre suas reuniões para manter o histórico.</p>
          </div>
        )}
      </div>
    </div>
  );
}
