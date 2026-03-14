import { useState } from 'react';
import { Bell, X, Check, AlertTriangle, DollarSign, Truck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/contexts/SocketContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useSocket();
  const [showDropdown, setShowDropdown] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'service': return <Truck className="h-4 w-4 text-blue-400" />;
      case 'offer': return <DollarSign className="h-4 w-4 text-green-400" />;
      case 'wallet': return <DollarSign className="h-4 w-4 text-yellow-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'chat': return <MessageSquare className="h-4 w-4 text-purple-400" />;
      default: return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000;

    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative">
      {/* Botón de campanita */}
      <Button
        variant="ghost"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative text-slate-400 hover:text-white p-2"
        data-testid="notification-bell"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown de notificaciones */}
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          <div className="absolute right-0 top-12 w-80 md:w-96 bg-[#111827] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0a1120]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#00e0ff]" />
                Notificaciones
                {unreadCount > 0 && (
                  <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} nueva{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-[#00e0ff] hover:text-white h-7 px-2"
                    title="Marcar todas como leídas"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearAllNotifications();
                      setShowDropdown(false);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 h-7 px-2"
                    title="Borrar todas"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No hay notificaciones</p>
                  <p className="text-slate-600 text-xs mt-1">Las notificaciones aparecerán aquí</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all ${
                      !notif.read ? 'bg-[#00e0ff]/5 border-l-2 border-l-[#00e0ff]' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 mt-0.5 p-2 rounded-lg ${
                        !notif.read ? 'bg-white/10' : 'bg-white/5'
                      }`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-tight ${
                          !notif.read ? 'text-white font-semibold' : 'text-slate-300'
                        }`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-600 mt-2">
                          {formatTime(notif.timestamp)}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="flex-shrink-0 mt-1">
                          <span className="h-2 w-2 bg-[#00e0ff] rounded-full block animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
