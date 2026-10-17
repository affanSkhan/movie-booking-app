import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock3, Film, Search, Sparkles, SlidersHorizontal, CalendarDays, X } from 'lucide-react';
import { moviesAPI, showsAPI } from '../services/api';

interface Movie {
  id: number;
  title: string;
  description?: string;
  poster_url?: string;
  duration?: number;
  created_at?: string;
}
interface Show { id: number; movie_id: number; show_time: string; screen: string; }

const listFrom = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { movies?: unknown }).movies)) return (payload as { movies: T[] }).movies;
  return [];
};
const formatDuration = (minutes?: number) => {
  if (!minutes || minutes < 1) return 'Runtime unavailable';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? hours + 'h' + (rest ? ' ' + rest + 'm' : '') : rest + ' min';
};

const Movies: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [runtimeFilter, setRuntimeFilter] = useState<'all' | 'short' | 'long'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'title' | 'duration'>('featured');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([moviesAPI.getAll(), showsAPI.getAll().catch(() => ({ data: [] }))])
      .then(([movieResponse, showResponse]) => {
        if (!active) return;
        setMovies(listFrom<Movie>(movieResponse.data));
        setShows(listFrom<Show>(showResponse.data));
      })
      .catch((reason: unknown) => {
        console.error('Unable to load movies:', reason);
        if (active) setError('We could not load the catalogue. Please retry in a moment.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  const filteredMovies = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = movies.filter((movie) => {
      const matchesQuery = ((movie.title || '') + ' ' + (movie.description || '')).toLowerCase().includes(query);
      const minutes = movie.duration || 0;
      const matchesRuntime = runtimeFilter === 'all' || (runtimeFilter === 'short' ? minutes > 0 && minutes <= 120 : minutes > 120);
      return matchesQuery && matchesRuntime;
    });
    return result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'duration') return (a.duration || 0) - (b.duration || 0);
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [movies, search, runtimeFilter, sortBy]);

  return (
    <div className="min-h-screen bg-background pb-16 pt-28 text-foreground sm:pt-32">
      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-orange-500/[0.11] via-card to-rose-500/[0.07] p-6 sm:p-9 lg:p-12">
          <div aria-hidden="true" className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.18em] text-primary"><Film className="h-3.5 w-3.5" /> The catalogue</div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Stories worth the screen.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Explore the collection, filter by runtime, and jump straight to a movie’s upcoming showtimes.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-bold">{movies.length} movies</span>
                <span className="rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-bold">{shows.length} showtimes scheduled</span>
              </div>
            </div>
            <Link to="/discover" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-lg shadow-orange-500/15 transition hover:-translate-y-0.5"><Sparkles className="h-4 w-4" /> Get an AI pick</Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground"><SlidersHorizontal className="h-4 w-4" /> Filter</span>
            {([{value:'all',label:'All runtimes'},{value:'short',label:'Up to 2 hours'},{value:'long',label:'Over 2 hours'}] as const).map((option) => (
              <button key={option.value} type="button" onClick={() => setRuntimeFilter(option.value)}
                className={'rounded-full border px-3.5 py-2 text-xs font-bold transition ' + (runtimeFilter === option.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground')}>
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <label className="relative flex min-w-0 items-center sm:min-w-[18rem]">
              <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or plot…" aria-label="Search the movie catalogue"
                className="h-11 w-full rounded-xl border border-input bg-card pl-11 pr-10 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15" />
              {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-3 rounded p-1 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
            </label>
            <label className="flex h-11 items-center gap-2 rounded-xl border border-input bg-card px-3.5 text-sm text-muted-foreground focus-within:border-primary">
              <CalendarDays className="h-4 w-4" /><span className="text-xs font-bold">Sort</span>
              <select aria-label="Sort movies" value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="max-w-[9rem] bg-transparent text-sm font-semibold text-foreground outline-none [&>option]:bg-background">
                <option value="featured">Recently added</option><option value="title">Title A–Z</option><option value="duration">Shortest first</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm"><p className="text-muted-foreground">{loading ? 'Loading movies…' : 'Showing ' + filteredMovies.length + ' of ' + movies.length + ' titles'}</p><p className="hidden text-xs text-muted-foreground sm:block">Select a poster to view showtimes</p></div>

        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">{Array.from({length:10}, (_, index) => <div key={index} className="animate-pulse"><div className="aspect-[2/3] rounded-2xl bg-muted" /><div className="mt-3 h-4 w-3/4 rounded bg-muted" /><div className="mt-2 h-3 w-1/2 rounded bg-muted/70" /></div>)}</div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-14 text-center"><Film className="mx-auto h-9 w-9 text-primary" /><h2 className="mt-4 text-xl font-extrabold">The catalogue is taking a break</h2><p className="mt-2 text-sm text-muted-foreground">{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Try again</button></div>
        ) : filteredMovies.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-14 text-center"><Search className="mx-auto h-9 w-9 text-muted-foreground" /><h2 className="mt-4 text-xl font-extrabold">No films found</h2><p className="mt-2 text-sm text-muted-foreground">Try another search or change your runtime filter.</p><button type="button" onClick={() => { setSearch(''); setRuntimeFilter('all'); }} className="mt-5 rounded-xl border border-border px-4 py-2.5 text-sm font-bold">Clear filters</button></div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {filteredMovies.map((movie, index) => (
              <motion.article key={movie.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28, delay: Math.min(index % 5, 4) * .035 }} className="group min-w-0">
                <button type="button" onClick={() => navigate('/showtimes/' + movie.id)} className="relative block aspect-[2/3] w-full overflow-hidden rounded-2xl border border-border bg-slate-900 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" aria-label={'View showtimes for ' + movie.title}>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_15%,rgba(251,146,60,.2),transparent_45%),linear-gradient(145deg,#242635,#101117)]" />
                  {movie.poster_url && <img src={movie.poster_url} alt="" aria-hidden="true" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/5 to-transparent" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/40 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur">{movie.duration ? <><Clock3 className="h-3 w-3" />{formatDuration(movie.duration)}</> : 'Movie'}</span>
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4"><p className="line-clamp-2 text-sm font-extrabold leading-snug text-white sm:text-base">{movie.title}</p><p className="mt-2 text-[11px] font-semibold text-orange-200">{shows.filter((show) => show.movie_id === movie.id).length} upcoming showtime(s)</p><span className="mt-2 inline-flex items-center gap-1.5 text-xs font-extrabold text-white/80">Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span></div>
                </button>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground sm:text-sm">{movie.description || 'Discover this title and find a showtime that suits you.'}</p>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Movies;
