import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Armchair, Monitor, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { seatsAPI } from '../services/api';
import { useSocket } from '../contexts/SocketContextInstance';
import { useAuth } from '../contexts/AuthContextInstance';

interface Seat {
  id: number;
  show_id?: number;
  seat_number: string;
  row_number: number;
  col_number: number;
  status: 'available' | 'locked' | 'booked';
  current_status?: 'available' | 'locked' | 'booked';
  locked_by?: number | null;
  lock_expires_at?: string | null;
}

interface SeatUpdate {
  status: 'available' | 'locked' | 'booked';
  userId?: number;
  lockExpiresAt?: string;
}

interface SeatMapProps {
  showId: string;
  seats: Seat[];
  onSeatSelect: (seatNumber: string) => void;
  onSeatDeselect: (seatNumber: string) => void;
  selectedSeats: string[];
  hideLegend?: boolean;
  refreshTrigger?: number;
  onRefreshRequested?: () => void | Promise<void>;
  onActionError?: (message: string) => void;
  onSelectionLimitReached?: () => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  const response = (error as { response?: { data?: { error?: string; message?: string } } })?.response;
  return response?.data?.error || response?.data?.message || fallback;
};

const SeatMap: React.FC<SeatMapProps> = ({
  showId,
  seats,
  onSeatSelect,
  onSeatDeselect,
  selectedSeats,
  hideLegend = false,
  refreshTrigger = 0,
  onRefreshRequested,
  onActionError,
  onSelectionLimitReached,
}) => {
  const { socket, joinShow, leaveShow, isConnected } = useSocket();
  const { user } = useAuth();
  const [seatUpdates, setSeatUpdates] = useState<Map<string, SeatUpdate>>(new Map());
  const [processingSeats, setProcessingSeats] = useState<Set<string>>(new Set());

  const refreshLatest = useCallback(() => {
    setSeatUpdates(new Map());
    if (onRefreshRequested) void onRefreshRequested();
  }, [onRefreshRequested]);

  useEffect(() => {
    if (isConnected) joinShow(showId);
    return () => {
      if (isConnected) leaveShow(showId);
    };
  }, [showId, isConnected, joinShow, leaveShow]);

  useEffect(() => {
    if (!socket) return;

    const handleSeatUpdate = (data: {
      seatNumber: string;
      status: 'available' | 'locked' | 'booked';
      userId?: number | null;
      lockExpiresAt?: string;
    }) => {
      if (!data?.seatNumber || !data?.status) return;
      setSeatUpdates((current) => {
        const next = new Map(current);
        next.set(data.seatNumber, {
          status: data.status,
          userId: data.userId == null ? undefined : Number(data.userId),
          lockExpiresAt: data.lockExpiresAt,
        });
        return next;
      });
    };

    socket.on('seat-updated', handleSeatUpdate);
    return () => {
      socket.off('seat-updated', handleSeatUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handleReconnect = () => refreshLatest();
    socket.on('connect', handleReconnect);
    return () => {
      socket.off('connect', handleReconnect);
    };
  }, [socket, refreshLatest]);

  useEffect(() => {
    setSeatUpdates(new Map());
  }, [refreshTrigger]);

  // Socket.IO makes changes immediate; the API refresh is the fallback when it is offline.
  useEffect(() => {
    if (isConnected || !onRefreshRequested) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void onRefreshRequested();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [isConnected, onRefreshRequested]);

  const getSeatStatus = useCallback((seat: Seat): SeatUpdate['status'] => {
    const update = seatUpdates.get(seat.seat_number);
    return update?.status || seat.current_status || seat.status;
  }, [seatUpdates]);

  const isSeatLockedByCurrentUser = useCallback((seat: Seat) => {
    const update = seatUpdates.get(seat.seat_number);
    if (update) return update.status === 'locked' && Number(update.userId) === Number(user?.id);
    return Number(seat.locked_by) === Number(user?.id) && Number(user?.id) > 0;
  }, [seatUpdates, user?.id]);

  const getSeatState = useCallback((seat: Seat) => {
    const status = getSeatStatus(seat);
    const ownLock = status === 'locked' && isSeatLockedByCurrentUser(seat);
    const isSelected = selectedSeats.includes(seat.seat_number) || ownLock;
    if (isSelected) return 'selected';
    if (status === 'booked') return 'booked';
    if (status === 'locked') return 'locked';
    return 'available';
  }, [getSeatStatus, isSeatLockedByCurrentUser, selectedSeats]);

  const handleSeatClick = async (seat: Seat) => {
    if (!user) {
      onActionError?.('Please sign in to select seats.');
      return;
    }
    if (processingSeats.has(seat.seat_number)) return;

    const status = getSeatStatus(seat);
    const ownLock = status === 'locked' && isSeatLockedByCurrentUser(seat);
    if (status === 'booked' || (status === 'locked' && !ownLock)) return;

    if (status === 'available' && selectedSeats.length >= 5) {
      onSelectionLimitReached?.();
      return;
    }

    setProcessingSeats((current) => new Set(current).add(seat.seat_number));
    try {
      if (status === 'available') {
        const response = await seatsAPI.select({ showId, seatNumber: seat.seat_number });
        setSeatUpdates((current) => {
          const next = new Map(current);
          next.set(seat.seat_number, {
            status: 'locked',
            userId: Number(user.id),
            lockExpiresAt: response.data?.lock_expires_at,
          });
          return next;
        });
        onSeatSelect(seat.seat_number);
      } else if (ownLock) {
        await seatsAPI.deselect({ showId, seatNumber: seat.seat_number });
        setSeatUpdates((current) => {
          const next = new Map(current);
          next.set(seat.seat_number, { status: 'available' });
          return next;
        });
        onSeatDeselect(seat.seat_number);
      }
    } catch (error) {
      onActionError?.(getErrorMessage(error, 'That seat could not be reserved. Availability has been refreshed.'));
      refreshLatest();
    } finally {
      setProcessingSeats((current) => {
        const next = new Set(current);
        next.delete(seat.seat_number);
        return next;
      });
    }
  };

  const groupedSeats = useMemo(() => {
    const groups = new Map<number, Seat[]>();
    seats.forEach((seat) => {
      const row = groups.get(seat.row_number) || [];
      row.push(seat);
      groups.set(seat.row_number, row);
    });
    return Array.from(groups.entries())
      .sort(([rowA], [rowB]) => rowA - rowB)
      .map(([rowNumber, rowSeats]) => ({
        rowNumber,
        label: rowSeats[0]?.seat_number.match(/^[A-Za-z]+/)?.[0] || String.fromCharCode(64 + rowNumber),
        seats: rowSeats.sort((a, b) => a.col_number - b.col_number),
      }));
  }, [seats]);

  if (!seats || seats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/25 px-5 py-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Armchair className="h-7 w-7" /></div>
        <h3 className="mt-4 text-lg font-bold">Seat map is being prepared</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-muted-foreground">No seats are available to display for this show yet. Refresh the seat map in a moment.</p>
        <button type="button" onClick={refreshLatest} className="btn-secondary mt-4"><RefreshCw className="h-4 w-4" /> Refresh seat map</button>
      </div>
    );
  }

  const stateStyles: Record<string, string> = {
    available: 'border-emerald-500/45 bg-emerald-500/10 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white dark:text-emerald-300 dark:hover:text-white',
    selected: 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25',
    locked: 'cursor-not-allowed border-rose-500/30 bg-rose-500/10 text-rose-700 opacity-80 dark:text-rose-300',
    booked: 'cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50',
  };

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-muted/60 to-transparent px-2 pb-2 pt-4 sm:px-4">
        <div className="mx-auto max-w-[600px]">
          <div className="relative mb-8 px-5 text-center">
            <div className="absolute left-[8%] right-[8%] top-0 h-10 rounded-[50%] border-t-2 border-primary/55 bg-gradient-to-b from-primary/15 to-transparent shadow-[0_-7px_24px_-14px_hsl(var(--primary))]" aria-hidden="true" />
            <div className="relative flex items-center justify-center gap-2 pt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              <Monitor className="h-3.5 w-3.5 text-primary" /> Screen this way
            </div>
          </div>

          <div className="space-y-2.5 overflow-x-auto pb-3">
            {groupedSeats.map(({ rowNumber, label, seats: rowSeats }) => (
              <div key={rowNumber} className="mx-auto flex min-w-max items-center justify-center gap-1.5 sm:gap-2">
                <span className="flex h-8 w-5 shrink-0 items-center justify-center text-[11px] font-bold text-muted-foreground">{label}</span>
                {rowSeats.map((seat) => {
                  const seatState = getSeatState(seat);
                  const status = getSeatStatus(seat);
                  const lockedByMe = status === 'locked' && isSeatLockedByCurrentUser(seat);
                  const disabled = processingSeats.has(seat.seat_number) || seatState === 'booked' || seatState === 'locked';
                  const labelText = seatState === 'selected'
                    ? 'Selected, seat ' + seat.seat_number + '. Click to release.'
                    : seatState === 'available'
                      ? 'Available, seat ' + seat.seat_number + '. Click to select.'
                      : seatState === 'booked'
                        ? 'Booked, seat ' + seat.seat_number
                        : 'Temporarily held by another guest, seat ' + seat.seat_number;

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => void handleSeatClick(seat)}
                      disabled={disabled && !lockedByMe}
                      aria-label={labelText}
                      aria-pressed={seatState === 'selected'}
                      title={labelText}
                      className={'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-t-lg rounded-b-md border text-[11px] font-bold transition duration-150 sm:h-9 sm:w-9 sm:text-xs ' + stateStyles[seatState] + (processingSeats.has(seat.seat_number) ? ' animate-pulse' : '') + (disabled && !lockedByMe ? ' cursor-not-allowed' : ' cursor-pointer hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card')}
                    >
                      {processingSeats.has(seat.seat_number) ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" aria-hidden="true" /> : seat.col_number}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/75">
            <span className="h-px w-7 bg-border" /> Back of auditorium <span className="h-px w-7 bg-border" />
          </div>
        </div>
      </div>

      {!hideLegend ? (
        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold">Seat legend</h3>
            <span className="text-xs text-muted-foreground">Select up to 5 seats</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3 text-xs sm:grid-cols-4 sm:text-sm">
            <div className="flex items-center gap-2"><span className="h-4 w-4 rounded-md border border-emerald-500/50 bg-emerald-500/15" /><span className="text-muted-foreground">Available</span></div>
            <div className="flex items-center gap-2"><span className="h-4 w-4 rounded-md border border-primary bg-primary" /><span className="text-muted-foreground">Selected by you</span></div>
            <div className="flex items-center gap-2"><span className="h-4 w-4 rounded-md border border-rose-500/40 bg-rose-500/15" /><span className="text-muted-foreground">Held by others</span></div>
            <div className="flex items-center gap-2"><span className="h-4 w-4 rounded-md border border-border bg-muted opacity-60" /><span className="text-muted-foreground">Booked</span></div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/65 px-3.5 py-3 text-xs">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          {isConnected ? <Wifi className="h-4 w-4 text-emerald-500" /> : <WifiOff className="h-4 w-4 text-amber-500" />}
          {isConnected ? <span><strong className="font-semibold text-foreground">Live updates on</strong> · Seats sync in real time</span> : <span><strong className="font-semibold text-foreground">Live updates paused</strong> · Server checks still protect seat selection</span>}
        </span>
        <button type="button" onClick={refreshLatest} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>
    </div>
  );
};

export default SeatMap;
