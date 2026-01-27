import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Plus, LogOut, Settings, BarChart3, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: FolderKanban, label: 'Projetos', href: '/projects' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
];

export function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 glass-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-glow-sm">
            <span className="text-sm font-bold text-white">DC</span>
          </div>
          <span className="text-lg font-semibold text-foreground gradient-premium">DevClient</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1.5 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-white/[0.08] text-foreground shadow-sm border border-white/[0.08]'
                    : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground'
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
          
          <Link
            to="/projects/new"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-300 mt-4"
          >
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Link>
          
          {/* Search hint */}
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                bubbles: true,
              });
              document.dispatchEvent(event);
            }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-all duration-300 w-full"
          >
            <Search className="h-4 w-4" />
            Buscar
            <kbd className="ml-auto text-[10px] font-mono bg-white/[0.05] px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </nav>

        {/* Notifications & User */}
        <div className="border-t border-white/[0.06] p-4">
          {/* Notification Dropdown */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">Notificações</span>
            <NotificationDropdown />
          </div>

          {/* User section */}
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 hover:bg-white/[0.05]",
              location.pathname === '/settings' && "bg-white/[0.08] border border-white/[0.08]"
            )}
          >
            <div className="relative">
              <Avatar className="h-9 w-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-sm font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {profile?.full_name || user?.email}
              </p>
              {profile?.full_name && (
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              )}
            </div>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="mt-2 w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </aside>
  );
}
