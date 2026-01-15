import { useRef } from 'react';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, Image, FileText, Trash2, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FilesTabProps {
  projectId: string;
}

const getFileIcon = (type: string | null) => {
  if (!type) return File;
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  return File;
};

export function FilesTab({ projectId }: FilesTabProps) {
  const { files, uploadFile, deleteFile } = useProjectFiles(projectId);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile.mutateAsync({ file, projectId });
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleUpload}
      />
      
      <Button
        onClick={() => inputRef.current?.click()}
        variant="outline"
        className="w-full"
        disabled={uploadFile.isPending}
      >
        {uploadFile.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        Enviar Arquivo
      </Button>

      <div className="grid gap-3 sm:grid-cols-2">
        {files.map((file) => {
          const Icon = getFileIcon(file.type);
          const isImage = file.type?.startsWith('image/');

          return (
            <Card key={file.id} className="overflow-hidden border-border/50">
              {isImage && (
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {!isImage && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(file.created_at), "d 'de' MMM", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteFile.mutate({ id: file.id, url: file.url })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {files.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          Nenhum arquivo enviado.
        </p>
      )}
    </div>
  );
}
