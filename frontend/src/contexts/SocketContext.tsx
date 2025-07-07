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
      const newSocket = io((import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api', ''), {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      newSocket.on('connect', () => {
        console.log('🔌 Connected to Socket.IO server');
        setIsConnected(true);
        
        // Authenticate the socket with user data
        if (user) {
          newSocket.emit('authenticate', {
            userId: user.id,
            email: user.email
          });
        }
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from Socket.IO server');
        setIsConnected(false);
      });

      newSocket.on('error', (error) => {
        console.error('❌ Socket.IO error:', error);
      });

      // Handle seat lock success
      newSocket.on('seat:lock:success', (data) => {
        console.log('✅ Seat lock successful:', data);
        // Emit a custom event for the SeatMap to clear processing state
        window.dispatchEvent(new CustomEvent('seat:lock:success', { detail: data }));
      });

      // Handle seat lock error
      newSocket.on('seat:lock:error', (data) => {
        console.error('❌ Seat lock failed:', data);
        // Emit a custom event for the SeatMap to clear processing state
        window.dispatchEvent(new CustomEvent('seat:lock:error', { detail: data }));
      });

      // Handle seat unlock success
      newSocket.on('seat:unlock:success', (data) => {
        console.log('✅ Seat unlock successful:', data);
        // Emit a custom event for the SeatMap to clear processing state
        window.dispatchEvent(new CustomEvent('seat:unlock:success', { detail: data }));
      });

      // Handle seat unlock error
      newSocket.on('seat:unlock:error', (data) => {
        console.error('❌ Seat unlock failed:', data);
        // Emit a custom event for the SeatMap to clear processing state
        window.dispatchEvent(new CustomEvent('seat:unlock:error', { detail: data }));
      });

      // Handle real-time seat updates
      newSocket.on('seat-updated', (data) => {
        console.log('🔄 Real-time seat update received:', data);
        // This will be handled by the SeatMap component
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user && socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [user]);

  const authenticateSocket = () => {
    if (socket && user && isConnected) {
      socket.emit('authenticate', {
        userId: user.id,
        email: user.email
      });
    }
  };

  const joinShow = (showId: string) => {
    if (socket && isConnected) {
      console.log(`🎬 Joining show room: ${showId}`);
      socket.emit('join-show', showId);
    }
  };

  const leaveShow = (showId: string) => {
    if (socket && isConnected) {
      console.log(`👋 Leaving show room: ${showId}`);
      socket.emit('leave-show', showId);
    }
  };

  const lockSeat = (seatId: number, seatNumber: string, showId: string) => {
    if (socket && isConnected && user) {
      console.log(`🔒 Locking seat: ${seatNumber} in show ${showId}`);
      socket.emit('seat:lock', {
        seatId,
        seatNumber,
        showId
      });
    }
  };

  const unlockSeat = (seatNumber: string, showId: string) => {
    if (socket && isConnected && user) {
      console.log(`🔓 Unlocking seat: ${seatNumber} in show ${showId}`);
      socket.emit('seat:unlock', {
        seatNumber,
        showId
      });
    }
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

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 