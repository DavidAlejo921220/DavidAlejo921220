import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check } from 'lucide-react';

export default function NotificationPermissionBanner() {
  const { pushPermission, requestPushPermission } = useSocket();

  // No mostrar si ya tiene permiso o lo denegó
  if (pushPermission === 'granted' || pushPermission === 'denied') {
    return null;
  }

  // No mostrar si no soporta notificaciones
  if (!('Notification' in window)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 shadow-2xl border border-white/20">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white/20 rounded-full">
          <Bell className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm">Activar Notificaciones</h3>
          <p className="text-white/80 text-xs mt-1">
            Recibe alertas de nuevos servicios, ofertas y cambios de estado aunque no estés en la app.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              onClick={requestPushPermission}
              size="sm"
              className="bg-white text-purple-600 hover:bg-white/90 font-bold"
            >
              <Check className="h-4 w-4 mr-1" />
              Activar
            </Button>
            <Button
              onClick={() => {
                // Marcar como "no preguntar más" en localStorage
                localStorage.setItem('push_prompt_dismissed', 'true');
                window.location.reload();
              }}
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Ahora no
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
