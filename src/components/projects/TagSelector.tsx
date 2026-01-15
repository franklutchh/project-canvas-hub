import { useState } from 'react';
import { useTags, useProjectTags, ProjectTag } from '@/hooks/useTags';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Plus, Check, Tag } from 'lucide-react';

const tagColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#64748b',
];

interface TagSelectorProps {
  projectId: string;
}

export function TagSelector({ projectId }: TagSelectorProps) {
  const { tags, createTag } = useTags();
  const { projectTags, addTagToProject, removeTagFromProject } = useProjectTags(projectId);
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(tagColors[0]);
  const [isCreating, setIsCreating] = useState(false);

  const projectTagIds = projectTags.map(t => t.id);

  const handleAddTag = async (tagId: string) => {
    if (!projectTagIds.includes(tagId)) {
      await addTagToProject.mutateAsync(tagId);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    await removeTagFromProject.mutateAsync(tagId);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    setIsCreating(true);
    try {
      const newTag = await createTag.mutateAsync({
        name: newTagName.trim(),
        color: selectedColor,
      });
      await addTagToProject.mutateAsync(newTag.id);
      setNewTagName('');
      setIsCreating(false);
    } catch {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {projectTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="gap-1 pr-1"
            style={{
              backgroundColor: `${tag.color}20`,
              borderColor: `${tag.color}50`,
              color: tag.color,
            }}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag.id)}
              className="ml-1 rounded-full p-0.5 hover:bg-foreground/10"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 gap-1 px-2 text-xs"
            >
              <Tag className="h-3 w-3" />
              Adicionar Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-3">
              <p className="text-sm font-medium">Tags Disponíveis</p>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {tags.map((tag) => {
                    const isSelected = projectTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => isSelected ? handleRemoveTag(tag.id) : handleAddTag(tag.id)}
                        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-all"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          borderColor: `${tag.color}50`,
                          color: tag.color,
                          border: '1px solid',
                        }}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-xs text-muted-foreground">Criar nova tag</p>
                <Input
                  placeholder="Nome da tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="h-8 text-sm"
                />
                <div className="flex gap-1">
                  {tagColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-5 w-5 rounded transition-all ${
                        selectedColor === color ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || isCreating}
                  className="w-full h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Criar Tag
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

interface TagBadgesProps {
  tags: ProjectTag[];
  size?: 'sm' | 'md';
}

export function TagBadges({ tags, size = 'sm' }: TagBadgesProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag) => (
        <Badge
          key={tag.id}
          variant="outline"
          className={size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs'}
          style={{
            backgroundColor: `${tag.color}20`,
            borderColor: `${tag.color}50`,
            color: tag.color,
          }}
        >
          {tag.name}
        </Badge>
      ))}
      {tags.length > 3 && (
        <Badge variant="outline" className={size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs'}>
          +{tags.length - 3}
        </Badge>
      )}
    </div>
  );
}
