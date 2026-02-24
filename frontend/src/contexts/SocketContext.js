import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(BACKEND_URL, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket conectado');
        
        if (user.role === 'driver') {
          newSocket.emit('join_room', { room: 'drivers' });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

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
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}