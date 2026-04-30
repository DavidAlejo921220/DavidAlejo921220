// Hook para manejar Web Push Notifications
import { useEffect, useCallback, useState } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState('default');
  const [swRegistration, setSwRegistration] = useState(null);

  // Registrar Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setSwRegistration(registration);
          setPermission(Notification.permission);
        })
        .catch(() => {
          // Service Worker no soportado o error
        });
    }
  }, []);

  // Solicitar permiso para notificaciones
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      return 'denied';
    }
  }, []);

  // Enviar notificación push local
  const sendNotification = useCallback((title, options = {}) => {
    if (permission !== 'granted') return false;

    // Si el documento está visible, no enviar push (ya se muestra el toast)
    if (document.visibilityState === 'visible') return false;

    try {
      if (swRegistration) {
        // Usar Service Worker para notificación persistente
        swRegistration.showNotification(title, {
          body: options.body || options.message,
          icon: '/logo192.png',
          badge: '/logo192.png',
          vibrate: [200, 100, 200],
          tag: options.tag || `gruaapp-${Date.now()}`,
          renotify: true,
          requireInteraction: options.requireInteraction || false,
          data: options.data || {},
          ...options
        });
        return true;
      } else if ('Notification' in window) {
        // Fallback a Notification API directa
        new Notification(title, {
          body: options.body || options.message,
          icon: '/logo192.png',
          tag: options.tag || `gruaapp-${Date.now()}`,
          ...options
        });
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }, [permission, swRegistration]);

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: 'Notification' in window && 'serviceWorker' in navigator
  };
}
