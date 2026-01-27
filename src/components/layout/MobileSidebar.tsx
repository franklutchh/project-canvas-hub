import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Plus, LogOut, Menu, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: FolderKanban, label: 'Projetos', href: '/projects' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
];

export function MobileSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const [open, setOpen] = useState(false);

  const handleNavClick = () => {
    setOpen(false);
  };

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="glass" 
          size="icon" 
          className="lg:hidden fixed top-4 left-4 z-50 rounded-xl shadow-premium"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-72 p-0 glass-sidebar border-r border-white/[0.06]"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-glow-sm">
              <span className="text-sm font-bold text-white">DC</span>
            </div>
            <span className="text-lg font-semibold gradient-premium">DevClient</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1.5 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300',
                    isActive
                      ? 'bg-white/[0.08] text-foreground border border-white/[0.08] shadow-sm'
                      : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground'
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  {item.label}
                </Link>
              );
            })}
            
            <Link
              to="/projects/new"
              onClick={handleNavClick}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-300 mt-4"
            >
              <Plus className="h-5 w-5" />
              Novo Projeto
            </Link>
          </nav>
          {/* Notifications */}
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Notificações</span>
              <NotificationDropdown />
            </div>
          </div>

          {/* User */}
          <div className="border-t border-white/[0.06] p-4">
            <Link
              to="/settings"
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-300 hover:bg-white/[0.05]",
                location.pathname === '/settings' && "bg-white/[0.08] border border-white/[0.08]"
              )}
            >
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-sm font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-background" />
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
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="mt-3 w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-white/[0.05] py-3"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
