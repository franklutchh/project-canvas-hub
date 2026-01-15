import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? <MobileSidebar /> : <Sidebar />}
      <main className={isMobile ? 'pt-16 px-4' : 'pl-64'}>
        <div className={isMobile ? 'py-4' : 'container py-8'}>
          {children}
        </div>
      </main>
    </div>
  );
}
