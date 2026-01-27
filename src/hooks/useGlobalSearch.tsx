import { useState, useEffect, useMemo, useCallback } from 'react';
import { useProjects } from './useProjects';
import { useRequirements } from './useRequirements';
import { Project, ProjectRequirement } from '@/types/database';

export type SearchResultType = 'project' | 'requirement' | 'page';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  path: string;
  icon?: string;
  projectId?: string;
}

const PAGES: SearchResult[] = [
  { id: 'dashboard', type: 'page', title: 'Dashboard', subtitle: 'Visão geral', path: '/', icon: 'LayoutDashboard' },
  { id: 'projects', type: 'page', title: 'Projetos', subtitle: 'Kanban de projetos', path: '/projects', icon: 'FolderKanban' },
  { id: 'analytics', type: 'page', title: 'Analytics', subtitle: 'Estatísticas', path: '/analytics', icon: 'BarChart3' },
  { id: 'settings', type: 'page', title: 'Configurações', subtitle: 'Perfil e preferências', path: '/settings', icon: 'Settings' },
  { id: 'new-project', type: 'page', title: 'Novo Projeto', subtitle: 'Criar projeto', path: '/projects/new', icon: 'Plus' },
];

const RECENT_SEARCHES_KEY = 'devClient_recentSearches';
const MAX_RECENT_SEARCHES = 5;

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const { projects, isLoading: projectsLoading } = useProjects();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  }, []);

  // Save recent search
  const addRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== searchQuery.toLowerCase());
      const updated = [searchQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    const searchResults: SearchResult[] = [];
    
    // Search pages
    PAGES.forEach(page => {
      if (
        page.title.toLowerCase().includes(normalizedQuery) ||
        page.subtitle?.toLowerCase().includes(normalizedQuery)
      ) {
        searchResults.push(page);
      }
    });
    
    // Search projects
    if (projects) {
      projects.forEach((project: Project) => {
        const matchesName = project.name.toLowerCase().includes(normalizedQuery);
        const matchesClient = project.client_name?.toLowerCase().includes(normalizedQuery);
        const matchesCompany = project.client_company?.toLowerCase().includes(normalizedQuery);
        
        if (matchesName || matchesClient || matchesCompany) {
          searchResults.push({
            id: project.id,
            type: 'project',
            title: project.name,
            subtitle: project.client_name || project.client_company || undefined,
            path: `/projects/${project.id}`,
            projectId: project.id,
          });
        }
      });
    }
    
    return searchResults;
  }, [query, projects]);

  // Grouped results
  const groupedResults = useMemo(() => {
    const groups: Record<SearchResultType, SearchResult[]> = {
      page: [],
      project: [],
      requirement: [],
    };
    
    results.forEach(result => {
      groups[result.type].push(result);
    });
    
    return groups;
  }, [results]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    query,
    setQuery,
    isOpen,
    open,
    close,
    toggle,
    results,
    groupedResults,
    isLoading: projectsLoading,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}
