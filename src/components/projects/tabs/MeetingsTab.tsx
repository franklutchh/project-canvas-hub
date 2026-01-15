import { useState } from 'react';
import { useMeetings } from '@/hooks/useMeetings';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Trash2, Calendar, Edit2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
        <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Nova Reunião
        </Button>
      ) : (
        <Card className="border-primary/50">
          <CardContent className="space-y-4 pt-4">
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
              <Button onClick={handleAdd}>Salvar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(meeting.date), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </div>
              <div className="flex gap-1">
                {editingId === meeting.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUpdate(meeting.id)}
                    >
                      <Check className="h-4 w-4 text-success" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(null)}
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
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMeeting.mutate(meeting.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingId === meeting.id ? (
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm">{meeting.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}

        {meetings.length === 0 && !isAdding && (
          <p className="py-8 text-center text-muted-foreground">
            Nenhuma reunião registrada.
          </p>
        )}
      </div>
    </div>
  );
}
