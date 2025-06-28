import { createContext, useContext } from 'react';
import type { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  joinShow: (showId: string) => void;
  leaveShow: (showId: string) => void;
  lockSeat: (seatId: number, seatNumber: string, showId: string) => void;
  unlockSeat: (seatNumber: string, showId: string) => void;
  isConnected: boolean;
  authenticateSocket: () => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 