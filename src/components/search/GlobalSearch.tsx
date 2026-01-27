import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Settings,
  Plus,
  Search,
  FolderOpen,
  Clock,
  X,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Settings,
  Plus,
};

interface GlobalSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GlobalSearch({ open: controlledOpen, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    isOpen: internalOpen,
    open,
    close,
    groupedResults,
    isLoading,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = useGlobalSearch();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (onOpenChange) {
          onOpenChange(!isOpen);
        } else {
          isOpen ? close() : open();
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, open, close, onOpenChange]);

  const handleSelect = useCallback((result: SearchResult) => {
    if (query.trim()) {
      addRecentSearch(query);
    }
    navigate(result.path);
    if (onOpenChange) {
      onOpenChange(false);
    } else {
      close();
    }
  }, [navigate, close, query, addRecentSearch, onOpenChange]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else if (newOpen) {
      open();
    } else {
      close();
    }
  }, [onOpenChange, open, close]);

  const getIcon = (result: SearchResult) => {
    if (result.type === 'project') {
      return <FolderOpen className="mr-2 h-4 w-4 text-primary" />;
    }
    if (result.icon && iconMap[result.icon]) {
      const Icon = iconMap[result.icon];
      return <Icon className="mr-2 h-4 w-4 text-muted-foreground" />;
    }
    return <Search className="mr-2 h-4 w-4 text-muted-foreground" />;
  };

  const hasResults = groupedResults.page.length > 0 || groupedResults.project.length > 0;

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <div className="flex items-center border-b border-white/[0.08] px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar projetos, páginas..."
          className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={() => setQuery('')} className="p-1 hover:bg-white/[0.05] rounded">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        <kbd className="ml-2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          ESC
        </kbd>
      </div>
      
      <CommandList className="max-h-[400px] overflow-y-auto">
        {query && !hasResults && !isLoading && (
          <CommandEmpty className="py-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <Search className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Nenhum resultado encontrado</p>
              <p className="text-xs text-muted-foreground/70">Tente buscar por outro termo</p>
            </div>
          </CommandEmpty>
        )}

        {!query && recentSearches.length > 0 && (
          <CommandGroup heading={
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Buscas Recentes
              </span>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar
              </button>
            </div>
          }>
            {recentSearches.map((search) => (
              <CommandItem
                key={search}
                value={search}
                onSelect={() => setQuery(search)}
                className="cursor-pointer"
              >
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{search}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {groupedResults.page.length > 0 && (
          <CommandGroup heading="Páginas">
            {groupedResults.page.map((result) => (
              <CommandItem
                key={result.id}
                value={`${result.title} ${result.subtitle || ''}`}
                onSelect={() => handleSelect(result)}
                className="cursor-pointer"
              >
                {getIcon(result)}
                <div className="flex flex-col">
                  <span>{result.title}</span>
                  {result.subtitle && (
                    <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {groupedResults.page.length > 0 && groupedResults.project.length > 0 && (
          <CommandSeparator className="my-1" />
        )}

        {groupedResults.project.length > 0 && (
          <CommandGroup heading="Projetos">
            {groupedResults.project.map((result) => (
              <CommandItem
                key={result.id}
                value={`${result.title} ${result.subtitle || ''}`}
                onSelect={() => handleSelect(result)}
                className="cursor-pointer"
              >
                {getIcon(result)}
                <div className="flex flex-col">
                  <span>{result.title}</span>
                  {result.subtitle && (
                    <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!query && (
          <>
            <CommandSeparator className="my-1" />
            <CommandGroup heading="Navegação Rápida">
              <CommandItem
                onSelect={() => handleSelect({ id: 'dashboard', type: 'page', title: 'Dashboard', path: '/' })}
                className="cursor-pointer"
              >
                <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Dashboard</span>
                <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                  G D
                </kbd>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect({ id: 'projects', type: 'page', title: 'Projetos', path: '/projects' })}
                className="cursor-pointer"
              >
                <FolderKanban className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Projetos</span>
                <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                  G P
                </kbd>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect({ id: 'analytics', type: 'page', title: 'Analytics', path: '/analytics' })}
                className="cursor-pointer"
              >
                <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Analytics</span>
                <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                  G A
                </kbd>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect({ id: 'new-project', type: 'page', title: 'Novo Projeto', path: '/projects/new' })}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Novo Projeto</span>
                <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                  N
                </kbd>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
      
      <div className="flex items-center justify-between border-t border-white/[0.08] px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Navegar:</span>
          <kbd className="rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5">↑↓</kbd>
          <span>Selecionar:</span>
          <kbd className="rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5">↵</kbd>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5">⌘</kbd>
          <kbd className="rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5">K</kbd>
          <span className="ml-1">para buscar</span>
        </div>
      </div>
    </CommandDialog>
  );
}
