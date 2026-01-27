import { useRef } from 'react';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, Image, FileText, Trash2, Download, Loader2, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
        variant="glass"
        className="w-full gap-2 py-6 border-dashed hover:border-primary/50"
        disabled={uploadFile.isPending}
      >
        {uploadFile.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Enviar Arquivo
      </Button>

      <div className="grid gap-3 sm:grid-cols-2">
        {files.map((file, index) => {
          const Icon = getFileIcon(file.type);
          const isImage = file.type?.startsWith('image/');

          return (
            <Card 
              key={file.id} 
              className={cn(
                "glass-card group overflow-hidden transition-all duration-300 hover:shadow-glow-sm animate-fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {isImage && (
                <div className="aspect-video overflow-hidden bg-muted/30">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {!isImage && (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(file.created_at), "d 'de' MMM", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteFile.mutate({ id: file.id, url: file.url, name: file.name })}
                      className="h-8 w-8 hover:bg-destructive/10"
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
        <div className="glass-card rounded-2xl py-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20">
              <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </div>
          <p className="text-muted-foreground">Nenhum arquivo enviado.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Faça upload de arquivos do projeto.</p>
        </div>
      )}
    </div>
  );
}
