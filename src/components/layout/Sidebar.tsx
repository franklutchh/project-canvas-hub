import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Plus, LogOut, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">DC</span>
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">DevClient</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          
          <Link
            to="/projects/new"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-all"
          >
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Link>
        </nav>

        {/* User */}
        <div className="border-t border-sidebar-border p-4">
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent/50",
              location.pathname === '/settings' && "bg-sidebar-accent"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
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
            className="mt-2 w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </aside>
  );
}
