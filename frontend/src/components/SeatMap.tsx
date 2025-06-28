import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContextInstance';
import { useAuth } from '../contexts/AuthContextInstance';

interface Seat {
  id: number;
  seat_number: string;
  row_number: number;
  col_number: number;
  status: 'available' | 'locked' | 'booked';
  current_status?: 'available' | 'locked' | 'booked';
  locked_by?: number;
  lock_expires_at?: string;
}

interface SeatMapProps {
  showId: string;
  seats: Seat[];
  onSeatSelect: (seatNumber: string) => void;
  onSeatDeselect: (seatNumber: string) => void;
  selectedSeats: string[];
}

const SeatMap: React.FC<SeatMapProps> = ({
  showId,
  seats,
  onSeatSelect,
  onSeatDeselect,
  selectedSeats,
}) => {
  const { socket, joinShow, leaveShow, lockSeat, unlockSeat, isConnected } = useSocket();
  const { user } = useAuth();
  const [seatUpdates, setSeatUpdates] = useState<Map<string, { status: string; userId?: number; lockExpiresAt?: string }>>(new Map());
  const [processingSeats, setProcessingSeats] = useState<Set<string>>(new Set());

  // Debug logging
  console.log('SeatMap render:', { 
    showId, 
    seatsCount: seats.length, 
    selectedSeats, 
    isConnected,
    user: user?.id,
    processingSeats: Array.from(processingSeats)
  });

  useEffect(() => {
    if (isConnected) {
      console.log('🎬 Joining show:', showId);
      joinShow(showId);
    }

    return () => {
      if (isConnected) {
        console.log('👋 Leaving show:', showId);
        leaveShow(showId);
      }
    };
  }, [showId, isConnected, joinShow, leaveShow]);

  useEffect(() => {
    if (!socket) return;

    const handleSeatUpdate = (data: { 
      seatNumber: string; 
      status: string; 
      userId?: number | null;
      lockExpiresAt?: string;
    }) => {
      console.log('🔄 Real-time seat update received:', data);
      console.log('🔄 Current seatUpdates before:', Array.from(seatUpdates.entries()));
      console.log('🔄 Current user ID:', user?.id);
      
      setSeatUpdates(prev => {
        const newUpdates = new Map(prev);
        newUpdates.set(data.seatNumber, {
          status: data.status,
          userId: data.userId || undefined,
          lockExpiresAt: data.lockExpiresAt
        });
        
        console.log('🔄 Updated seatUpdates after:', Array.from(newUpdates.entries()));
        return newUpdates;
      });
    };

    // Handle seat operation completion events
    const handleSeatLockSuccess = (event: CustomEvent) => {
      console.log('✅ Seat lock success event:', event.detail);
      setProcessingSeats(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.detail.seatNumber);
        return newSet;
      });
    };

    const handleSeatLockError = (event: CustomEvent) => {
      console.log('❌ Seat lock error event:', event.detail);
      setProcessingSeats(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.detail.seatNumber);
        return newSet;
      });
    };

    const handleSeatUnlockSuccess = (event: CustomEvent) => {
      console.log('✅ Seat unlock success event:', event.detail);
      setProcessingSeats(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.detail.seatNumber);
        return newSet;
      });
    };

    const handleSeatUnlockError = (event: CustomEvent) => {
      console.log('❌ Seat unlock error event:', event.detail);
      setProcessingSeats(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.detail.seatNumber);
        return newSet;
      });
    };

    socket.on('seat-updated', handleSeatUpdate);
    window.addEventListener('seat:lock:success', handleSeatLockSuccess as EventListener);
    window.addEventListener('seat:lock:error', handleSeatLockError as EventListener);
    window.addEventListener('seat:unlock:success', handleSeatUnlockSuccess as EventListener);
    window.addEventListener('seat:unlock:error', handleSeatUnlockError as EventListener);

    return () => {
      socket.off('seat-updated', handleSeatUpdate);
      window.removeEventListener('seat:lock:success', handleSeatLockSuccess as EventListener);
      window.removeEventListener('seat:lock:error', handleSeatLockError as EventListener);
      window.removeEventListener('seat:unlock:success', handleSeatUnlockSuccess as EventListener);
      window.removeEventListener('seat:unlock:error', handleSeatUnlockError as EventListener);
    };
  }, [socket, seatUpdates]);

  const handleSeatClick = (seat: Seat) => {
    if (!user) return;

    console.log('🪑 Seat clicked:', seat);

    const currentStatus = getSeatStatus(seat);
    
    if (currentStatus === 'available') {
      // Lock the seat
      console.log('🔒 Locking seat:', seat.seat_number);
      setProcessingSeats(prev => new Set(prev).add(seat.seat_number));
      lockSeat(seat.id, seat.seat_number, showId);
      onSeatSelect(seat.seat_number);
    } else if (currentStatus === 'locked') {
      if (isSeatLockedByCurrentUser(seat)) {
        // Unlock the seat (only if locked by current user)
        console.log('🔓 Unlocking seat:', seat.seat_number);
        setProcessingSeats(prev => new Set(prev).add(seat.seat_number));
        unlockSeat(seat.seat_number, showId);
        onSeatDeselect(seat.seat_number);
      }
    }
    // If seat is locked by others or booked, do nothing (not clickable)
  };

  const getSeatStatus = (seat: Seat) => {
    // Check for real-time updates first
    const realTimeUpdate = seatUpdates.get(seat.seat_number);
    if (realTimeUpdate) {
      return realTimeUpdate.status;
    }

    // Use current_status from database (handles expired locks)
    return seat.current_status || seat.status;
  };

  const isSeatLockedByCurrentUser = (seat: Seat): boolean => {
    const realTimeUpdate = seatUpdates.get(seat.seat_number);
    
    if (realTimeUpdate) {
      // Use real-time update data
      const isLockedByCurrentUser = realTimeUpdate.userId === user?.id;
      console.log(`🔍 Seat ${seat.seat_number} - Real-time update: userId=${realTimeUpdate.userId}, currentUser=${user?.id}, isLockedByCurrentUser=${isLockedByCurrentUser}`);
      return isLockedByCurrentUser;
    } else {
      // Use database data
      const isLockedByCurrentUser = seat.locked_by === user?.id;
      console.log(`🔍 Seat ${seat.seat_number} - Database data: locked_by=${seat.locked_by}, currentUser=${user?.id}, isLockedByCurrentUser=${isLockedByCurrentUser}`);
      return isLockedByCurrentUser;
    }
  };

  const getSeatColor = (status: string, seat: Seat) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600';
      case 'locked': {
        // Check if locked by current user
        const isLockedByCurrentUser = isSeatLockedByCurrentUser(seat);
        
        if (isLockedByCurrentUser) {
          return 'bg-orange-500 hover:bg-orange-600'; // 🟠 Selected by current user
        } else {
          return 'bg-red-500 cursor-not-allowed'; // 🔴 Locked by others
        }
      }
      case 'booked':
        return 'bg-gray-800 cursor-not-allowed'; // ⚫ Booked
      default:
        return 'bg-gray-400';
    }
  };

  const getSeatText = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-white';
      case 'locked':
        return 'text-white';
      case 'booked':
        return 'text-white';
      default:
        return 'text-gray-600';
    }
  };

  const isSeatClickable = (seat: Seat) => {
    const status = getSeatStatus(seat);
    
    if (status === 'available') {
      return true;
    }
    
    if (status === 'locked') {
      return isSeatLockedByCurrentUser(seat);
    }
    
    return false;
  };

  const getSeatTooltip = (seat: Seat) => {
    const status = getSeatStatus(seat);
    switch (status) {
      case 'available':
        return 'Click to select this seat';
      case 'locked': {
        const isLockedByCurrentUser = isSeatLockedByCurrentUser(seat);
        
        if (isLockedByCurrentUser) {
          return 'Click to unselect this seat';
        } else {
          return 'This seat is locked by another user';
        }
      }
      case 'booked':
        return 'This seat is already booked';
      default:
        return '';
    }
  };

  // If no seats are provided, show a message
  if (!seats || seats.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <div className="text-gray-400 text-6xl mb-4">🪑</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Seats Available
          </h3>
          <p className="text-gray-600 mb-4">
            Seats for this show haven't been configured yet.
          </p>
          <div className="text-sm text-gray-500">
            <p>Show ID: {showId}</p>
            <p>Seats Count: {seats?.length || 0}</p>
            <p>Socket Connected: {isConnected ? 'Yes' : 'No'}</p>
            <p>User ID: {user?.id || 'Not logged in'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.row_number;
    if (!acc[row]) {
      acc[row] = [];
    }
    acc[row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  // Sort rows and seats within each row
  const sortedRows = Object.keys(seatsByRow)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="text-center">
        <div className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg inline-block">
          🎬 SCREEN
        </div>
      </div>

      {/* Seat Grid */}
      <div className="space-y-2">
        {sortedRows.map((row) => (
          <div key={row} className="flex justify-center space-x-1">
            <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-600">
              {String.fromCharCode(64 + row)} {/* A, B, C, etc. */}
            </div>
            {seatsByRow[row]
              .sort((a, b) => a.col_number - b.col_number)
              .map((seat) => {
                const status = getSeatStatus(seat);
                const isClickable = isSeatClickable(seat);
                const tooltip = getSeatTooltip(seat);
                
                return (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={!isClickable || processingSeats.has(seat.seat_number)}
                    title={tooltip}
                    className={`
                      w-8 h-8 rounded text-xs font-medium transition-colors duration-200
                      ${getSeatColor(status, seat)}
                      ${getSeatText(status)}
                      ${isClickable && !processingSeats.has(seat.seat_number) ? 'cursor-pointer' : 'cursor-not-allowed'}
                      ${isClickable && !processingSeats.has(seat.seat_number) ? 'hover:scale-105' : ''}
                      ${processingSeats.has(seat.seat_number) ? 'animate-pulse opacity-75' : ''}
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    `}
                  >
                    {processingSeats.has(seat.seat_number) ? '⏳' : seat.col_number}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Seat Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>🟢 Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>🟠 Selected by You</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>🔴 Locked by Others</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-800 rounded"></div>
            <span>⚫ Booked</span>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="text-center text-sm text-gray-600">
        <div className="flex items-center justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? '🟢 Connected - Real-time updates active' : '🔴 Disconnected - No real-time updates'}</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap; 