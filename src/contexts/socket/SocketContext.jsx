import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../auth/AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef();
  const { user } = useAuth();

  useEffect(() => {
          socketRef.current = io('https://31.97.70.79:5050', {
      transports: ['websocket'],
      autoConnect: true,
    });

    // Handle connection and join user room
    socketRef.current.on('connect', () => {
      console.log('🔌 WebSocket connected');
      
      // Join user room for personalized notifications
      if (user?.id) {
        socketRef.current.emit('join-user', { userId: user.id });
        console.log('👤 Joined user room:', user.id);
      }
    });

    // Handle disconnection
    socketRef.current.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Re-join user room when user changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && user?.id) {
      socketRef.current.emit('join-user', { userId: user.id });
      console.log('👤 Re-joined user room:', user.id);
    }
  }, [user?.id]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);