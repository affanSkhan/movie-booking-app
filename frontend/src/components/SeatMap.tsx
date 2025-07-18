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
  hideLegend?: boolean;
  refreshTrigger?: number;
  onRefreshRequested?: () => void;
}

const SeatMap: React.FC<SeatMapProps> = ({
  showId,
  seats,
  onSeatSelect,
  onSeatDeselect,
  selectedSeats,
  hideLegend = false,
  refreshTrigger = 0,
  onRefreshRequested,
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

  // Listen for socket reconnect and request seat map refresh
  useEffect(() => {
    if (!socket) return;
    const handleReconnect = () => {
      console.log('🔄 Socket reconnected, requesting seat map refresh');
      setSeatUpdates(new Map()); // clear real-time updates
      if (onRefreshRequested) onRefreshRequested();
    };
    socket.on('connect', handleReconnect);
    return () => {
      socket.off('connect', handleReconnect);
    };
  }, [socket, onRefreshRequested]);

  // Also refresh if parent triggers via refreshTrigger prop
  useEffect(() => {
    setSeatUpdates(new Map());
  }, [refreshTrigger]);

  const handleSeatClick = (seat: Seat) => {
    if (!user) return;
    const currentStatus = getSeatStatus(seat);
    if (currentStatus === 'available') {
      // Only lock if not at max
      if (selectedSeats.length >= 5) return;
      lockSeat(seat.id, seat.seat_number, showId);
      onSeatSelect(seat.seat_number);
    } else if (currentStatus === 'locked') {
      if (isSeatLockedByCurrentUser(seat)) {
        unlockSeat(seat.seat_number, showId);
        onSeatDeselect(seat.seat_number);
      }
    }
    // If seat is locked by others or booked, do nothing
  };

  const getSeatStatus = (seat: Seat) => {
    // Check for real-time updates first
    const realTimeUpdate = seatUpdates.get(seat.seat_number);
    if (realTimeUpdate) {
      console.log('[SeatMap] getSeatStatus realTimeUpdate:', seat.seat_number, realTimeUpdate);
      return realTimeUpdate.status;
    }
    // Use current_status from database (handles expired locks)
    return seat.current_status || seat.status;
  };

  const isSeatLockedByCurrentUser = (seat: Seat): boolean => {
    const realTimeUpdate = seatUpdates.get(seat.seat_number);
    if (realTimeUpdate) {
      const isLockedByCurrentUser = realTimeUpdate.userId === user?.id;
      console.log(`[SeatMap] isSeatLockedByCurrentUser: seat=${seat.seat_number}, realTimeUserId=${realTimeUpdate.userId}, currentUser=${user?.id}, result=${isLockedByCurrentUser}`);
      return isLockedByCurrentUser;
    } else {
      const isLockedByCurrentUser = seat.locked_by === user?.id;
      console.log(`[SeatMap] isSeatLockedByCurrentUser: seat=${seat.seat_number}, dbLockedBy=${seat.locked_by}, currentUser=${user?.id}, result=${isLockedByCurrentUser}`);
      return isLockedByCurrentUser;
    }
  };

  const getSeatColor = (status: string, seat: Seat) => {
    let color = 'bg-gray-400';
    switch (status) {
      case 'available':
        color = 'bg-green-500 hover:bg-green-600';
        break;
      case 'locked': {
        const isLockedByCurrentUser = isSeatLockedByCurrentUser(seat);
        color = isLockedByCurrentUser ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-500 cursor-not-allowed';
        break;
      }
      case 'booked':
        color = 'bg-gray-800 cursor-not-allowed';
        break;
      default:
        color = 'bg-gray-400';
    }
    console.log(`[SeatMap] getSeatColor: seat=${seat.seat_number}, status=${status}, user=${user?.id}, color=${color}`);
    return color;
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
      return isSeatLockedByCurrentUser(seat); // allow current user to always click
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
        <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg text-center border border-gray-200 dark:border-gray-600">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🪑</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Seats Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Seats for this show haven't been configured yet.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
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
        <div className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg inline-block border border-gray-400 dark:border-gray-500">
           SCREEN
        </div>
      </div>

      {/* Seat Grid */}
      <div className="space-y-2">
        {sortedRows.map((row) => (
          <div key={row} className="flex justify-center space-x-1">
            <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
              {String.fromCharCode(64 + row)} {/* A, B, C, etc. */}
            </div>
            {seatsByRow[row]
              .sort((a, b) => a.col_number - b.col_number)
              .map((seat) => {
                const status = getSeatStatus(seat);
                const tooltip = getSeatTooltip(seat);
                
                return (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={status === 'booked' || (status === 'locked' && !isSeatLockedByCurrentUser(seat))}
                    title={tooltip}
                    className={`
                      w-8 h-8 rounded text-xs font-medium transition-colors duration-200
                      ${getSeatColor(status, seat)}
                      ${getSeatText(status)}
                      ${isSeatClickable(seat) ? 'cursor-pointer' : 'cursor-not-allowed'}
                      ${isSeatClickable(seat) ? 'hover:scale-105' : ''}
                      ${processingSeats.has(seat.seat_number) ? 'animate-pulse opacity-75' : ''}
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                    `}
                  >
                    {seat.col_number}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      {/* Legend */}
      {!hideLegend && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Seat Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300"> Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300"> Selected by You</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300"> Locked by Others</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-800 dark:bg-gray-900 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300"> Booked</span>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? ' Connected - Real-time updates active' : ' Disconnected - No real-time updates'}</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap; 