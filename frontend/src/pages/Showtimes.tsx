import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Film, MapPin, Search, Sparkles, Ticket } from 'lucide-react';
import { moviesAPI, showsAPI } from '../services/api';

interface Movie { id: number; title: string; description?: string; poster_url?: string; duration?: number; }
interface Show { id: number; movie_id: number; show_time: string; screen: string; created_at?: string; }
interface ShowWithMovie extends Show { movie?: Movie; }

const listFrom = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { shows?: unknown }).shows)) return (payload as { shows: T[] }).shows;
  return [];
};
const dateKey = (dateValue: string | Date) => {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
};
const formatDate = (value: string) => new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(value));
const formatTime = (value: string) => new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
const formatLongDate = (value: string) => new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(value));

const Showtimes: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<ShowWithMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [screenFilter, setScreenFilter] = useState('all');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([moviesAPI.getAll(), showsAPI.getAll()])
      .then(([movieResponse, showResponse]) => {
        if (!active) return;
        const moviePayload = listFrom<Movie>(movieResponse.data);
        const showPayload = listFrom<Show>(showResponse.data);
        setMovies(moviePayload);
        const movieMap = new Map(moviePayload.map((movie) => [Number(movie.id), movie]));
        setShows(showPayload.map((show) => ({ ...show, movie: movieMap.get(Number(show.movie_id)) })));
      })
      .catch((reason: unknown) => {
        console.error('Unable to load showtimes:', reason);
        if (active) setError('We could not load the show schedule. Please try again.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  const selectedMovie = movies.find((movie) => String(movie.id) === movieId);
  const now = Date.now();
  const upcomingShows = useMemo(() => {
    return shows
      .filter((show) => !movieId || String(show.movie_id) === movieId)
      .filter((show) => new Date(show.show_time).getTime() >= now)
      .filter((show) => selectedDate === 'all' || dateKey(show.show_time) === selectedDate)
      .filter((show) => screenFilter === 'all' || show.screen === screenFilter)
      .sort((a, b) => new Date(a.show_time).getTime() - new Date(b.show_time).getTime());
  }, [shows, movieId, selectedDate, screenFilter, now]);

  const screens = Array.from(new Set(shows.filter((show) => new Date(show.show_time).getTime() >= now).map((show) => show.screen).filter(Boolean))).sort();
  const today = dateKey(new Date());
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = dateKey(tomorrowDate);

  const groupedShows = useMemo(() => {
    const groups = new Map<string, ShowWithMovie[]>();
    upcomingShows.forEach((show) => {
      const key = dateKey(show.show_time);
      groups.set(key, [...(groups.get(key) || []), show]);
    });
    return Array.from(groups.entries());
  }, [upcomingShows]);

  return (
    <div className="min-h-screen bg-background pb-16 pt-28 text-foreground sm:pt-32">
      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-orange-500/[0.10] via-card to-amber-500/[0.04] p-6 sm:p-9 lg:p-11">
          <div aria-hidden="true" className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="relative max-w-3xl">
            {movieId && <button type="button" onClick={() => navigate('/movies')} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to movies</button>}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.18em] text-primary"><CalendarDays className="h-3.5 w-3.5" /> THE SHOW SCHEDULE</div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{selectedMovie ? selectedMovie.title : 'Find your perfect showtime'}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{selectedMovie?.description || 'Browse upcoming screenings, compare times and screens, then reserve your seats in a few clicks.'}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-bold">{upcomingShows.length} matching showtime(s)</span>
              <span className="rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-bold">Choose your seats</span>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[{value:'all',label:'All dates'},{value:today,label:'Today'},{value:tomorrow,label:'Tomorrow'}].map((option) => (
              <button type="button" key={option.value} onClick={() => setSelectedDate(option.value)} className={'rounded-full border px-4 py-2 text-xs font-bold transition ' + (selectedDate === option.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:text-foreground')}>{option.label}</button>
            ))}
            <label className="flex h-9 items-center gap-2 rounded-full border border-border bg-background px-3 text-xs font-bold text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <input type="date" min={today} value={selectedDate === 'all' ? '' : selectedDate} onChange={(event) => setSelectedDate(event.target.value || 'all')} className="max-w-[8.5rem] bg-transparent text-xs text-foreground outline-none" aria-label="Choose a show date" />
            </label>
          </div>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-input bg-background px-3 text-sm"><Search className="h-4 w-4 text-muted-foreground" /><span className="text-xs font-bold text-muted-foreground">Screen</span><select value={screenFilter} onChange={(event) => setScreenFilter(event.target.value)} className="bg-transparent text-sm font-bold outline-none [&>option]:bg-background" aria-label="Filter by screen"><option value="all">All screens</option>{screens.map((screen) => <option key={screen} value={screen}>{screen}</option>)}</select></label>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">{[0,1,2,3].map((item) => <div key={item} className="flex animate-pulse gap-4 rounded-2xl border border-border bg-card p-4"><div className="h-36 w-24 rounded-xl bg-muted" /><div className="flex-1 py-2"><div className="h-4 w-3/4 rounded bg-muted" /><div className="mt-4 h-3 w-1/2 rounded bg-muted" /><div className="mt-8 h-9 w-1/2 rounded bg-muted" /></div></div>)}</div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-14 text-center"><CalendarDays className="mx-auto h-9 w-9 text-primary" /><h2 className="mt-4 text-xl font-extrabold">Showtimes are unavailable</h2><p className="mt-2 text-sm text-muted-foreground">{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Try again</button></div>
        ) : upcomingShows.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-14 text-center"><CalendarDays className="mx-auto h-9 w-9 text-muted-foreground" /><h2 className="mt-4 text-xl font-extrabold">No showtimes match those filters</h2><p className="mt-2 text-sm text-muted-foreground">{selectedMovie ? 'Try another date or browse the full schedule.' : 'Try another date or screen, or explore the available movies.'}</p><div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => { setSelectedDate('all'); setScreenFilter('all'); }} className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold">Clear filters</button><Link to="/movies" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Browse movies</Link></div></div>
        ) : (
          <div className="mt-8 space-y-9">
            {groupedShows.map(([date, dayShows]) => (
              <section key={date}>
                <div className="mb-4 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="h-5 w-5" /></div><div><h2 className="text-lg font-extrabold">{formatLongDate(dayShows[0].show_time)}</h2><p className="mt-0.5 text-xs text-muted-foreground">{dayShows.length} screening(s)</p></div></div>
                <div className="grid gap-4 md:grid-cols-2">
                  {dayShows.map((show, index) => (
                    <motion.article key={show.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25, delay: Math.min(index, 5) * .035 }} className="group flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg sm:gap-5 sm:p-5">
                      <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-900 sm:h-40 sm:w-28">
                        {show.movie?.poster_url ? <img src={show.movie.poster_url} alt={show.movie.title + ' poster'} loading="lazy" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} /> : <div className="flex h-full items-center justify-center text-white/45"><Film className="h-8 w-8" /></div>}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="line-clamp-2 text-base font-extrabold leading-snug sm:text-lg">{show.movie?.title || 'Movie screening'}</p>
                        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs font-semibold text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-primary" />{formatTime(show.show_time)}</span><span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{show.screen || 'Screen TBA'}</span></div>
                        <p className="mt-1.5 text-xs text-muted-foreground">{formatDate(show.show_time)}</p>
                        <div className="mt-auto pt-4"><button type="button" onClick={() => navigate('/book/' + show.id)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-extrabold text-primary-foreground transition hover:brightness-105">Choose seats <Ticket className="h-3.5 w-3.5" /><ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></button></div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-primary/15 bg-primary/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><h3 className="font-extrabold">Need help picking a movie?</h3><p className="mt-1 text-sm text-muted-foreground">Tell Movie Muse what mood you’re in and get a personalised shortlist.</p></div></div>
          <Link to="/discover" className="inline-flex shrink-0 items-center gap-2 text-sm font-extrabold text-primary hover:underline">AI Discover <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
};

export default Showtimes;
