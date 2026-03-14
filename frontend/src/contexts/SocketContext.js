import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const SocketContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Cargar notificaciones del localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`notifications_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      }
    }
  }, [user]);

  // Función para agregar notificación
  const addNotification = useCallback((notification) => {
    if (!user) return;
    
    const newNotif = {
      id: Date.now(),
      ...notification,
      read: false,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50);
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => prev + 1);

    // Mostrar toast también
    if (notification.showToast !== false) {
      toast(notification.title, {
        description: notification.message,
        duration: 5000
      });
    }
  }, [user]);

  // Marcar como leída
  const markAsRead = useCallback((id) => {
    if (!user) return;
    
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [user]);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    if (!user) return;
    
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
  }, [user]);

  // Limpiar todas
  const clearAllNotifications = useCallback(() => {
    if (!user) return;
    
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem(`notifications_${user.id}`);
  }, [user]);

  useEffect(() => {
    if (user) {
      const newSocket = io(BACKEND_URL, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket conectado');
        
        // Unirse a rooms según rol
        if (user.role === 'driver') {
          newSocket.emit('join_room', { room: 'drivers' });
          newSocket.emit('join_room', { room: `driver_${user.id}` });
        } else if (user.role === 'client') {
          newSocket.emit('join_room', { room: 'all_clients' });
          newSocket.emit('join_room', { room: `client_${user.id}` });
        }
      });

      // Escuchar eventos para notificaciones
      newSocket.on('new_service', (data) => {
        if (user.role === 'driver') {
          addNotification({
            type: 'service',
            title: '🚗 Nuevo Servicio Disponible',
            message: `Vehículo ${data.vehicle_type} necesita grúa cerca de ti`,
            data
          });
        }
      });

      newSocket.on('new_offer', (data) => {
        if (user.role === 'client') {
          addNotification({
            type: 'offer',
            title: '💰 Nueva Oferta Recibida',
            message: `Un conductor ha enviado una oferta de ${data.price?.toLocaleString('es-CO')} COP`,
            data
          });
        }
      });

      newSocket.on('offer_accepted', (data) => {
        if (user.role === 'driver') {
          addNotification({
            type: 'offer',
            title: '✅ ¡Oferta Aceptada!',
            message: 'Un cliente ha aceptado tu oferta. Dirígete al punto de recogida.',
            data
          });
        }
      });

      newSocket.on('offer_rejected', (data) => {
        if (user.role === 'driver') {
          addNotification({
            type: 'warning',
            title: '❌ Oferta Rechazada',
            message: 'El cliente ha rechazado tu oferta.',
            data,
            showToast: false
          });
        }
      });

      newSocket.on('wallet_updated', (data) => {
        if (user.role === 'driver') {
          addNotification({
            type: 'wallet',
            title: data.transaction?.amount > 0 ? '💵 Recarga Recibida' : '💸 Comisión Descontada',
            message: data.transaction?.description || `Nuevo saldo: ${data.balance?.toLocaleString('es-CO')} COP`,
            data
          });

          if (data.needs_recharge) {
            addNotification({
              type: 'warning',
              title: '⚠️ Saldo Bajo',
              message: 'Tu saldo está bajo. Recarga pronto para seguir recibiendo servicios.',
              data
            });
          }
        }
      });

      newSocket.on('driver_nearby', (data) => {
        if (user.role === 'client') {
          addNotification({
            type: 'service',
            title: '🚛 ¡Grúa Cerca!',
            message: data.message || 'La grúa está llegando a tu ubicación',
            data
          });
        }
      });

      newSocket.on('status_updated', (data) => {
        const statusMessages = {
          'on_way': '🚛 La grúa va en camino',
          'picked_up': '🔧 Vehículo recogido',
          'in_transit': '🛣️ En tránsito al destino',
          'completed': '✅ Servicio completado'
        };
        
        addNotification({
          type: 'service',
          title: 'Estado Actualizado',
          message: statusMessages[data.status] || `Estado: ${data.status}`,
          data
        });
      });

      newSocket.on('new_message', (data) => {
        if (data.sender_id !== user.id) {
          addNotification({
            type: 'chat',
            title: '💬 Nuevo Mensaje',
            message: data.message?.substring(0, 50) || 'Has recibido un mensaje',
            data
          });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, addNotification]);

  const joinServiceRoom = (serviceId) => {
    if (socket) {
      socket.emit('join_room', { room: `service_${serviceId}` });
    }
  };

  const leaveServiceRoom = (serviceId) => {
    if (socket) {
      socket.emit('leave_room', { room: `service_${serviceId}` });
    }
  };

  const value = {
    socket,
    joinServiceRoom,
    leaveServiceRoom,
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
