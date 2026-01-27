import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  Clock,
  AlertTriangle,
  RefreshCw,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'comment':
      return <MessageSquare className="h-4 w-4 text-blue-400" />;
    case 'deadline':
      return <Clock className="h-4 w-4 text-amber-400" />;
    case 'deadline_warning':
      return <AlertTriangle className="h-4 w-4 text-red-400" />;
    case 'status_change':
      return <RefreshCw className="h-4 w-4 text-emerald-400" />;
    default:
      return <Bell className="h-4 w-4 text-primary" />;
  }
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (projectId: string | null) => void;
}) {
  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200",
        "hover:bg-white/[0.05] cursor-pointer",
        !notification.read && "bg-primary/5 border-l-2 border-primary"
      )}
      onClick={() => {
        if (!notification.read) {
          onMarkAsRead(notification.id);
        }
        if (notification.project_id) {
          onNavigate(notification.project_id);
        }
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div className="h-8 w-8 rounded-xl bg-white/[0.05] flex items-center justify-center">
          {getNotificationIcon(notification.type)}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm leading-tight",
          notification.read ? "text-muted-foreground" : "text-foreground font-medium"
        )}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground/70 mt-1.5">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="p-1.5 rounded-lg hover:bg-white/[0.1] text-muted-foreground hover:text-foreground transition-colors"
            title="Marcar como lida"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
          title="Excluir"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNavigate = (projectId: string | null) => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl hover:bg-white/[0.05]"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent
        className="w-80 p-0 glass-premium border-white/[0.08]"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({unreadCount} novas)
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="h-12 w-12 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Nenhuma notificação ainda
              </p>
              <p className="text-xs text-muted-foreground/70 text-center mt-1">
                Você será notificado sobre atividades importantes
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-2 border-t border-white/[0.06]">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground gap-2"
              onClick={() => {
                navigate('/notifications');
                setOpen(false);
              }}
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Ver todas as notificações
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
