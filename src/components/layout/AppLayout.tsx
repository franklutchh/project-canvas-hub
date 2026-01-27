import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { KeyboardShortcutsModal } from '@/components/ui/keyboard-shortcuts-modal';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [gPressed, setGPressed] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Handle G + key combinations
      if (gPressed) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            navigate('/');
            break;
          case 'p':
            e.preventDefault();
            navigate('/projects');
            break;
          case 'a':
            e.preventDefault();
            navigate('/analytics');
            break;
          case 's':
            e.preventDefault();
            navigate('/settings');
            break;
        }
        setGPressed(false);
        return;
      }

      // G key starts a combo
      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey) {
        setGPressed(true);
        setTimeout(() => setGPressed(false), 1000); // Reset after 1 second
        return;
      }

      // N - New Project
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        navigate('/projects/new');
      }

      // / - Focus search (open command palette)
      if (e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, gPressed]);

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(225 12% 15%) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />
      
      {isMobile ? <MobileSidebar /> : <Sidebar />}
      
      <main className={isMobile ? 'pt-20 px-4 pb-8' : 'pl-64'}>
        <div className={isMobile ? 'animate-fade-in' : 'container py-8 animate-fade-in'}>
          {children}
        </div>
      </main>

      {/* Global Search Command Palette */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
}
