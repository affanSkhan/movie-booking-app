import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContextInstance';
import { SocketContext } from './SocketContextInstance';

interface SocketContextType {
  socket: Socket | null;
  joinShow: (showId: string) => void;
  leaveShow: (showId: string) => void;
  lockSeat: (seatId: number, seatNumber: string, showId: string) => void;
  unlockSeat: (seatNumber: string, showId: string) => void;
  isConnected: boolean;
  authenticateSocket: () => void;
}

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      let socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      if (socketUrl.endsWith('/api')) {
        socketUrl = socketUrl.replace(/\/api$/, '');
      }
      const token = localStorage.getItem('token');
      // Never print authentication tokens to browser logs.
      console.info('[Socket] Connecting to real-time service:', socketUrl, 'token available:', Boolean(token));
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.info('[Socket] Real-time seat updates connected.');
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.warn('[Socket] Real-time updates disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('error', () => {
        console.error('[Socket] Real-time service reported an error.');
      });

      newSocket.on('seat:lock:success', (data) => {
        window.dispatchEvent(new CustomEvent('seat:lock:success', { detail: data }));
      });
      newSocket.on('seat:lock:error', (data) => {
        window.dispatchEvent(new CustomEvent('seat:lock:error', { detail: data }));
      });
      newSocket.on('seat:unlock:success', (data) => {
        window.dispatchEvent(new CustomEvent('seat:unlock:success', { detail: data }));
      });
      newSocket.on('seat:unlock:error', (data) => {
        window.dispatchEvent(new CustomEvent('seat:unlock:error', { detail: data }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }

    setSocket((current) => {
      if (current) current.close();
      return null;
    });
    setIsConnected(false);
    return undefined;
  }, [user]);

  const authenticateSocket = () => {};

  const joinShow = (showId: string) => {
    if (socket && isConnected) socket.emit('join-show', showId);
  };

  const leaveShow = (showId: string) => {
    if (socket && isConnected) socket.emit('leave-show', showId);
  };

  // SeatMap calls the authenticated REST API for locking; these methods remain
  // available to other callers and only run when a socket connection is active.
  const lockSeat = (seatId: number, seatNumber: string, showId: string) => {
    if (socket && isConnected && user) socket.emit('seat:lock', { seatId, seatNumber, showId });
  };

  const unlockSeat = (seatNumber: string, showId: string) => {
    if (socket && isConnected && user) socket.emit('seat:unlock', { seatNumber, showId });
  };

  const value: SocketContextType = {
    socket,
    joinShow,
    leaveShow,
    lockSeat,
    unlockSeat,
    isConnected,
    authenticateSocket,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
