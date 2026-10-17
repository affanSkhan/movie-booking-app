import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Clapperboard, Clock3, Film, Search, Sparkles, Ticket,
  SunMedium, Popcorn, ShieldCheck, X, ChevronRight,
} from 'lucide-react';
import { moviesAPI } from '../services/api';

interface Movie {
  id: number;
  title: string;
  description?: string;
  poster_url?: string;
  duration?: number;
  created_at?: string;
}

const durationLabel = (minutes?: number) => {
  if (!minutes || minutes <= 0) return 'Runtime unavailable';
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return hours ? hours + 'h' + (remaining ? ' ' + remaining + 'm' : '') : remaining + ' min';
};

const Poster: React.FC<{ movie: Movie; className?: string }> = ({ movie, className = '' }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [movie.poster_url]);
  return (
    <div className={'relative h-full w-full overflow-hidden bg-slate-900 ' + className}>
      {movie.poster_url && !failed ? (
        <img src={movie.poster_url} alt={movie.title + ' poster'} loading="lazy" decoding="async"
          onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="flex h-full min-h-40 flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_20%_15%,rgba(251,146,60,.34),transparent_48%),linear-gradient(145deg,#292b3b,#101117)] text-white/55">
          <Clapperboard className="h-8 w-8" />
          <span className="text-[10px] font-semibold uppercase tracking-[.25em]">MovieBook</span>
        </div>
      )}
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    moviesAPI.getAll()
      .then((response) => {
        const payload = response.data;
        const list = Array.isArray(payload) ? payload : Array.isArray(payload?.movies) ? payload.movies : [];
        if (active) setMovies(list);
      })
      .catch((reason: unknown) => {
        console.error('Unable to load the movie catalogue:', reason);
        if (active) setError('We could not load the catalogue right now. Please check your connection and try again.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retryKey]);

  const filteredMovies = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return movies.filter((movie) => ((movie.title || '') + ' ' + (movie.description || '')).toLocaleLowerCase().includes(query));
  }, [movies, search]);

  const featured = movies.find((movie) => movie.poster_url) || movies[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border/70 bg-gradient-to-br from-orange-500/[0.09] via-background to-amber-500/[0.04] pt-28 sm:pt-32">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-14 h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-rose-400/[0.07] blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 sm:px-8 sm:pb-20 lg:grid-cols-[1.08fr_.92fr] lg:gap-12 lg:px-10 lg:pb-24">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/[0.08] px-3.5 py-2 text-xs font-bold tracking-wide text-orange-700 dark:text-orange-200">
              <Sparkles className="h-3.5 w-3.5" /> YOUR PERSONAL CINEMA COMPANION
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-.045em] sm:text-5xl lg:text-6xl">
              Big-screen stories.
              <span className="mt-1 block bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">One great night.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Discover your next favourite, find a showtime that fits, and pick your seats in a few easy steps.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/movies" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg shadow-orange-500/15 transition hover:-translate-y-0.5 hover:brightness-105">
                Explore movies <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/discover" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-5 py-3.5 text-sm font-bold transition hover:border-primary/40 hover:bg-muted">
                <Sparkles className="h-4 w-4 text-primary" /> Ask Movie Muse
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Simple, secure booking</span>
              <span className="inline-flex items-center gap-2"><Ticket className="h-4 w-4 text-primary" /> Pick your own seats</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .65, delay: .08 }} className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-orange-500/15 via-transparent to-rose-500/10 blur-2xl" />
            {featured ? (
              <div className="relative grid grid-cols-[1fr_.78fr] items-center gap-3 sm:gap-5">
                <div className="group relative aspect-[2/3] overflow-hidden rounded-3xl border border-border/70 bg-slate-900 shadow-2xl shadow-slate-900/20">
                  <Poster movie={featured} className="absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[.24em] text-orange-200">Featured pick</p>
                    <h2 className="text-xl font-extrabold leading-tight sm:text-2xl">{featured.title}</h2>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/70"><Clock3 className="h-3.5 w-3.5" /> {durationLabel(featured.duration)}</p>
                    <button type="button" onClick={() => navigate('/showtimes/' + featured.id)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-orange-100">Find showtimes <ArrowRight className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-5">
                  {movies.filter((movie) => movie.id !== featured.id && movie.poster_url).slice(0, 2).map((movie) => (
                    <button key={movie.id} type="button" onClick={() => navigate('/showtimes/' + movie.id)} className="group relative block w-full overflow-hidden rounded-2xl border border-border/80 bg-card text-left shadow-lg transition hover:-translate-y-1">
                      <div className="aspect-[4/3] overflow-hidden">
                        <Poster movie={movie} />
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="line-clamp-2 text-sm font-extrabold leading-snug">{movie.title}</p>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">{durationLabel(movie.duration)}</p>
                      </div>
                    </button>
                  ))}
                  <div className="rounded-2xl border border-primary/15 bg-primary/[0.06] p-4 sm:p-5">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-extrabold">Not sure what to watch?</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">Tell Movie Muse your mood, genre, or time limit.</p>
                    <Link to="/discover" className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-primary">Get a recommendation <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative flex aspect-[5/4] items-center justify-center rounded-3xl border border-border bg-card text-center">
                <div><Film className="mx-auto h-12 w-12 text-primary" /><p className="mt-4 font-bold">Your next movie night starts here</p><Link className="mt-4 inline-flex text-sm font-bold text-primary" to="/movies">Browse movies <ArrowRight className="ml-2 h-4 w-4" /></Link></div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-card/45">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:grid-cols-3 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-primary"><Ticket className="h-5 w-5" /></span><div><p className="text-sm font-extrabold">Your seats, your choice</p><p className="mt-1 text-xs text-muted-foreground">Choose the spot you love</p></div></div>
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-primary"><Clock3 className="h-5 w-5" /></span><div><p className="text-sm font-extrabold">Easy showtime planning</p><p className="mt-1 text-xs text-muted-foreground">Find a time that works for you</p></div></div>
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-primary"><Popcorn className="h-5 w-5" /></span><div><p className="text-sm font-extrabold">A little movie magic</p><p className="mt-1 text-xs text-muted-foreground">Turn an ordinary night into a story</p></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18 lg:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.22em] text-primary"><span className="h-px w-7 bg-primary" /> THE COLLECTION</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Find your next favourite</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Search the catalogue, explore the stories, and book your next cinema experience.</p>
          </div>
          <label className="relative flex w-full items-center sm:max-w-sm">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Search movies or stories…" aria-label="Search movies"
              className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-10 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15" />
            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-3 rounded-md p-1 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </label>
        </div>
        <div className="mt-7 flex items-center justify-between border-b border-border pb-4 text-xs text-muted-foreground">
          <span>{loading ? 'Loading the collection…' : error ? 'Catalogue unavailable' : filteredMovies.length + ' title' + (filteredMovies.length === 1 ? '' : 's')}</span>
          <Link to="/movies" className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline">Full catalogue <ChevronRight className="h-4 w-4" /></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 pt-7 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">{[0,1,2,3,4].map((item) => <div key={item} className="animate-pulse"><div className="aspect-[2/3] rounded-2xl bg-muted" /><div className="mt-3 h-4 w-3/4 rounded bg-muted" /><div className="mt-2 h-3 w-1/2 rounded bg-muted/70" /></div>)}</div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-14 text-center"><Film className="mx-auto h-8 w-8 text-primary" /><h3 className="mt-4 text-lg font-extrabold">The show must go on</h3><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{error}</p><button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Try again</button></div>
        ) : filteredMovies.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-14 text-center"><Search className="mx-auto h-8 w-8 text-muted-foreground" /><h3 className="mt-4 text-lg font-extrabold">No matching movies</h3><p className="mt-2 text-sm text-muted-foreground">Try a different title or clear your search.</p></div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pt-7 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {filteredMovies.slice(0, 10).map((movie, index) => (
              <motion.article key={movie.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .3, delay: (index % 5) * .04 }} className="group min-w-0">
                <button type="button" onClick={() => navigate('/showtimes/' + movie.id)} aria-label={'View showtimes for ' + movie.title} className="relative block aspect-[2/3] w-full overflow-hidden rounded-2xl border border-border bg-slate-900 text-left shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                  <Poster movie={movie} className="absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/5 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-lg border border-white/20 bg-black/40 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">{durationLabel(movie.duration)}</div>
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4"><p className="line-clamp-2 text-sm font-extrabold leading-snug text-white sm:text-base">{movie.title}</p><p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-200 sm:text-xs">Choose a showtime <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></p></div>
                </button>
                {movie.description && <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground sm:text-sm">{movie.description}</p>}
              </motion.article>
            ))}
          </div>
        )}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/15 bg-primary/[0.06] p-5 sm:flex-row sm:items-center sm:p-7">
          <div><h3 className="text-base font-extrabold sm:text-lg">Want a film picked for your mood?</h3><p className="mt-1 text-sm text-muted-foreground">Movie Muse can match your vibe, genre, and runtime.</p></div>
          <Link to="/discover" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground">Try AI Discover <Sparkles className="h-4 w-4" /></Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card/55">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <Link to="/" className="inline-flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-300 to-orange-500 text-slate-950"><Clapperboard className="h-5 w-5" /></span><span><span className="block text-sm font-extrabold">MovieBook</span><span className="mt-0.5 block text-[10px] uppercase tracking-[.2em] text-muted-foreground">Make it a movie night</span></span></Link>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground"><Link to="/movies" className="hover:text-foreground">Movies</Link><Link to="/showtimes" className="hover:text-foreground">Showtimes</Link><Link to="/discover" className="hover:text-foreground">AI Discover</Link><Link to="/my-bookings" className="hover:text-foreground">My bookings</Link></div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} MovieBook. Made for movie lovers.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
