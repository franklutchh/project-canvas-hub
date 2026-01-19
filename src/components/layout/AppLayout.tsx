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
    </div>
  );
}
