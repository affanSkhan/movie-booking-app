import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Film,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Ticket,
  X,
} from 'lucide-react';
import { moviesAPI, seatsAPI, showsAPI } from '../services/api';
import api from '../services/api';
import SeatMap from '../components/SeatMap';
import Toast from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContextInstance';

interface Movie {
  id: number;
  title: string;
  description: string;
  poster_url?: string;
  duration?: number;
  created_at: string;
}

interface Show {
  id: number;
  movie_id: number;
  show_time: string;
  screen: string;
  created_at: string;
}

interface Seat {
  id: number;
  show_id: number;
  seat_number: string;
  row_number: number;
  col_number: number;
  status: 'available' | 'locked' | 'booked';
  current_status?: 'available' | 'locked' | 'booked';
  locked_by?: number | null;
  lock_expires_at?: string | null;
}

const SEAT_PRICE = 250;
const MAX_SEATS = 5;
const SELECTION_HOLD_SECONDS = 60;

const getErrorMessage = (error: unknown, fallback: string) => {
  const response = (error as { response?: { data?: { error?: string; message?: string } } })?.response;
  return response?.data?.error || response?.data?.message || fallback;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const BookShow: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingSeats, setRefreshingSeats] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [proceeding, setProceeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [selectionTimeLeft, setSelectionTimeLeft] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const selectionTimerRef = useRef<ReturnType<typeof window.setInterval> | null>(null);
  const selectedSeatsRef = useRef<string[]>([]);

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (!showId) {
        setError('This booking link is missing a show ID.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [showResponse, seatsResponse] = await Promise.all([
          showsAPI.getById(showId),
          seatsAPI.getByShow(showId),
        ]);
        const fetchedShow = showResponse.data as Show;
        const movieResponse = await moviesAPI.getById(String(fetchedShow.movie_id));

        if (cancelled) return;
        setShow(fetchedShow);
        setMovie(movieResponse.data as Movie);
        setSeats(Array.isArray(seatsResponse.data) ? seatsResponse.data as Seat[] : []);
      } catch (fetchError) {
        if (cancelled) return;
        setError(getErrorMessage(fetchError, 'We could not load this show. Check your connection and try again.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [showId]);

  const reloadSeats = useCallback(async () => {
    if (!showId) return;

    setRefreshingSeats(true);
    try {
      const response = await seatsAPI.getByShow(showId);
      const freshSeats = Array.isArray(response.data) ? response.data as Seat[] : [];
      setSeats(freshSeats);
      setRefreshFailed(false);
      setRefreshTrigger((value) => value + 1);

      const stillHeld = new Set(
        freshSeats
          .filter((seat) => {
            const status = seat.current_status || seat.status;
            return status === 'locked' && Number(seat.locked_by) === Number(user?.id);
          })
          .map((seat) => seat.seat_number),
      );
      const expiredSeats = selectedSeatsRef.current.filter((seatNumber) => !stillHeld.has(seatNumber));
      if (expiredSeats.length > 0) {
        selectedSeatsRef.current = selectedSeatsRef.current.filter((seatNumber) => stillHeld.has(seatNumber));
        setSelectedSeats((current) => current.filter((seatNumber) => stillHeld.has(seatNumber)));
        setToast({
          message: 'A seat hold expired or changed. Please review your seats before continuing.',
          type: 'error',
        });
      }
    } catch {
      setRefreshFailed(true);
    } finally {
      setRefreshingSeats(false);
    }
  }, [showId, user?.id]);

  useEffect(() => {
    if (selectedSeats.length === 0) {
      if (selectionTimerRef.current !== null) {
        window.clearInterval(selectionTimerRef.current);
        selectionTimerRef.current = null;
      }
      setSelectionTimeLeft(null);
      return;
    }

    if (selectionTimerRef.current !== null) return;

    setSelectionTimeLeft(SELECTION_HOLD_SECONDS);
    selectionTimerRef.current = window.setInterval(() => {
      setSelectionTimeLeft((remaining) => {
        if (remaining === null) return null;
        if (remaining <= 1) {
          if (selectionTimerRef.current !== null) {
            window.clearInterval(selectionTimerRef.current);
            selectionTimerRef.current = null;
          }

          const seatsToRelease = [...selectedSeatsRef.current];
          selectedSeatsRef.current = [];
          setSelectedSeats([]);
          void Promise.allSettled(
            seatsToRelease.map((seatNumber) =>
              seatsAPI.deselect({ showId: String(showId), seatNumber }),
            ),
          );
          setToast({
            message: 'Your one-minute seat selection hold expired. Please select your seats again.',
            type: 'error',
          });
          return null;
        }
        return remaining - 1;
      });
    }, 1000);
  }, [selectedSeats.length, showId]);

  useEffect(() => {
    return () => {
      if (selectionTimerRef.current !== null) {
        window.clearInterval(selectionTimerRef.current);
        selectionTimerRef.current = null;
      }
    };
  }, []);

  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeats((current) => {
      if (current.includes(seatNumber)) return current;
      if (current.length >= MAX_SEATS) {
        setToast({ message: 'You can book up to five seats per order.', type: 'error' });
        return current;
      }
      return [...current, seatNumber].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    });
  };

  // SeatMap calls this only after the server confirms that a seat was unlocked.
  const handleSeatDeselect = (seatNumber: string) => {
    setSelectedSeats((current) => current.filter((seat) => seat !== seatNumber));
  };

  const removeSeatFromSummary = async (seatNumber: string) => {
    if (!showId) return;
    try {
      await seatsAPI.deselect({ showId, seatNumber });
      handleSeatDeselect(seatNumber);
    } catch (removeError) {
      setToast({ message: getErrorMessage(removeError, 'Could not release that seat. Please try again.'), type: 'error' });
      void reloadSeats();
    }
  };

  const handleProceedToPayment = async () => {
    if (!showId || !movie || !show || selectedSeats.length === 0 || proceeding) {
      if (selectedSeats.length === 0) {
        setToast({ message: 'Choose at least one available seat to continue.', type: 'error' });
      }
      return;
    }

    setProceeding(true);
    const seatsForPayment = [...selectedSeats];

    try {
      await api.post('/seats/extend-lock', {
        showId,
        seatNumbers: seatsForPayment,
        durationMinutes: 10,
      });

      if (selectionTimerRef.current !== null) {
        window.clearInterval(selectionTimerRef.current);
        selectionTimerRef.current = null;
      }
      setSelectionTimeLeft(null);
      sessionStorage.setItem('paymentFlowStarted', 'true');
      navigate('/payment', {
        state: {
          showId,
          movie,
          show,
          selectedSeats: seatsForPayment,
          totalPrice: seatsForPayment.length * SEAT_PRICE,
          seatPrice: SEAT_PRICE,
          paymentStart: Date.now(),
        },
      });
    } catch (paymentError) {
      setToast({
        message: getErrorMessage(paymentError, 'Your seat hold could not be extended. Refresh the seat map and try again.'),
        type: 'error',
      });
      await reloadSeats();
    } finally {
      setProceeding(false);
    }
  };

  const formatShowTime = (value: string) => {
    const dateValue = new Date(value);
    if (Number.isNaN(dateValue.getTime())) {
      return { time: 'Time to be confirmed', date: 'Date to be confirmed' };
    }
    return {
      time: dateValue.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      date: dateValue.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    };
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-5 pt-24 text-center">
        <span className="h-12 w-12 animate-spin rounded-full border-2 border-primary/20 border-t-primary" aria-hidden="true" />
        <div>
          <h1 className="text-lg font-semibold text-foreground">Preparing your seat map</h1>
          <p className="mt-1 text-sm text-muted-foreground">Getting show details and the latest seat availability…</p>
        </div>
      </div>
    );
  }

  if (error || !movie || !show) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-5 pt-24">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Film className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">We couldn’t open this show</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{error || 'The show may have been removed or is no longer available.'}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button className="btn-primary" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
            <button className="btn-secondary" onClick={() => navigate('/showtimes')}>
              Browse showtimes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { time, date } = formatShowTime(show.show_time);
  const totalPrice = selectedSeats.length * SEAT_PRICE;
  const availableSeatCount = seats.filter((seat) => (seat.current_status || seat.status) === 'available').length;
  const timerLabel = selectionTimeLeft === null
    ? null
    : Math.floor(selectionTimeLeft / 60).toString().padStart(2, '0') + ':' + (selectionTimeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-background pb-12 pt-20 text-foreground">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={() => (window.history.length > 2 ? navigate(-1) : navigate('/showtimes'))}
            className="btn-ghost -ml-2"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" /> <span>Back</span>
          </button>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex" aria-label="Booking steps">
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 font-semibold text-primary"><CheckCircle2 className="h-3.5 w-3.5" /> Show</span>
            <span className="h-px w-5 bg-border" />
            <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 font-semibold text-primary-foreground"><Ticket className="h-3.5 w-3.5" /> Seats</span>
            <span className="h-px w-5 bg-border" />
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-muted-foreground"><CreditCard className="h-3.5 w-3.5" /> Payment</span>
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative mb-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-orange-400 to-amber-300" aria-hidden="true" />
          <div className="flex flex-col gap-5 p-5 pl-6 sm:flex-row sm:items-center sm:p-6 sm:pl-7">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md sm:h-32 sm:w-[90px]">
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={movie.title + ' poster'}
                  className="h-full w-full object-cover"
                  loading="eager"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/25 to-muted">
                  <Film className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Your movie night</p>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{movie.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-muted/70 px-3 py-1.5"><CalendarDays className="h-4 w-4 text-primary" />{date}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-muted/70 px-3 py-1.5"><Clock3 className="h-4 w-4 text-primary" />{time}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-muted/70 px-3 py-1.5"><MapPin className="h-4 w-4 text-primary" />Screen {show.screen}</span>
                {movie.duration ? <span className="inline-flex items-center gap-2 rounded-full bg-muted/70 px-3 py-1.5"><Film className="h-4 w-4 text-primary" />{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span> : null}
              </div>
            </div>
            <div className="rounded-2xl bg-primary/8 px-4 py-3 sm:min-w-32 sm:text-right">
              <p className="text-xs text-muted-foreground">Ticket price</p>
              <p className="text-2xl font-black tracking-tight text-primary">{formatCurrency(SEAT_PRICE)}</p>
              <p className="text-xs text-muted-foreground">per seat</p>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.8fr)] lg:gap-7">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="min-w-0 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6 lg:p-7"
          >
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="h-4.5 w-4.5" /></div>
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Choose your seats</h2>
                </div>
                <p className="mt-1 pl-11 text-sm text-muted-foreground">Tap an available seat to reserve it temporarily.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="rounded-full border border-border bg-muted/60 px-3 py-1.5 text-sm font-semibold">
                  {availableSeatCount} available
                </span>
                <button
                  onClick={() => void reloadSeats()}
                  disabled={refreshingSeats}
                  className="btn-secondary px-3 py-2 text-sm"
                  aria-label="Refresh seat availability"
                >
                  <RefreshCw className={'h-4 w-4 ' + (refreshingSeats ? 'animate-spin' : '')} />
                  <span className="hidden sm:inline">{refreshingSeats ? 'Checking…' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {refreshFailed ? (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-800 dark:text-amber-200" role="status">
                <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1">Seat availability couldn’t be refreshed. Existing information is shown; try refreshing again.</div>
                <button className="font-semibold underline underline-offset-2" onClick={() => void reloadSeats()}>Retry</button>
              </div>
            ) : null}

            {timerLabel ? (
              <div className={'mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-sm ' + (selectionTimeLeft !== null && selectionTimeLeft <= 15 ? 'border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300' : 'border-primary/25 bg-primary/8 text-foreground')} role="status" aria-live="polite">
                <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /><span>Your seat selection hold expires in <strong>{timerLabel}</strong></span></div>
                <span className="text-xs text-muted-foreground">Continue to extend the hold for payment.</span>
              </div>
            ) : null}

            <SeatMap
              showId={showId || String(show.id)}
              seats={seats}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              onSeatDeselect={handleSeatDeselect}
              refreshTrigger={refreshTrigger}
              onRefreshRequested={reloadSeats}
              onActionError={(message) => setToast({ message, type: 'error' })}
              onSelectionLimitReached={() => setToast({ message: 'You can select a maximum of five seats per booking.', type: 'error' })}
            />

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" />Seat locks are verified by the server</span>
              <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 text-primary" />Availability refreshes automatically</span>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="min-w-0 lg:sticky lg:top-24"
          >
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-bold">Booking summary</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Review before you pay</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Ticket className="h-5 w-5" /></div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Selected seats</h3>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold">{selectedSeats.length}/{MAX_SEATS}</span>
                  </div>

                  {selectedSeats.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
                      <Ticket className="mx-auto h-6 w-6 text-muted-foreground/60" />
                      <p className="mt-2 text-sm font-medium text-foreground">Your seats will appear here</p>
                      <p className="mt-1 text-xs text-muted-foreground">Choose up to {MAX_SEATS} seats from the map.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence initial={false}>
                        {selectedSeats.map((seatNumber) => (
                          <motion.div
                            key={seatNumber}
                            initial={{ opacity: 0, scale: 0.88 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.88 }}
                            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-bold text-primary"
                          >
                            {seatNumber}
                            <button
                              type="button"
                              onClick={() => void removeSeatFromSummary(seatNumber)}
                              aria-label={'Remove seat ' + seatNumber}
                              title={'Release seat ' + seatNumber}
                              className="rounded-md p-0.5 transition hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-y border-border py-4">
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Ticket price</span><span className="font-medium">{formatCurrency(SEAT_PRICE)}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Seats</span><span className="font-medium">{selectedSeats.length}</span></div>
                  <div className="flex items-center justify-between pt-1"><span className="text-base font-bold">Total</span><span className="text-2xl font-black tracking-tight text-primary">{formatCurrency(totalPrice)}</span></div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleProceedToPayment()}
                  disabled={selectedSeats.length === 0 || proceeding}
                  className="btn-primary w-full py-3.5 text-base shadow-md shadow-primary/15 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {proceeding ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current/25 border-t-current" /> Securing seats…</> : <><CreditCard className="h-5 w-5" /> Continue to payment <span className="font-extrabold">{formatCurrency(totalPrice)}</span></>}
                </button>

                <div className="flex items-start gap-2 rounded-xl bg-muted/55 p-3 text-xs leading-5 text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <p>Seats are held for 1 minute while you choose. Continuing to payment extends the hold to 10 minutes. Your booking is confirmed only after successful payment.</p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 px-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              No payment is taken on this screen
            </div>
          </motion.aside>
        </div>
      </div>

      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </div>
  );
};

export default BookShow;
