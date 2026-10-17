import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clapperboard,
  Clock3,
  Film,
  Popcorn,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  X,
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

type SortOption = 'newest' | 'title' | 'runtime';

const formatDuration = (minutes?: number) => {
  if (!minutes || minutes <= 0) return 'Runtime unavailable';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours ? hours + 'h ' + (remainingMinutes ? remainingMinutes + 'm' : '') : remainingMinutes + ' min';
};

const MoviePoster: React.FC<{ movie: Movie; eager?: boolean; className?: string }> = ({
  movie,
  eager = false,
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [movie.poster_url]);

  return (
    <div className={'relative isolate h-full w-full overflow-hidden bg-[#181923] ' + className}>
      {movie.poster_url && !failed ? (
        <img
          src={movie.poster_url}
          alt={movie.title + ' poster'}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_25%_15%,rgba(250,111,76,0.24),transparent_42%),linear-gradient(145deg,#292b3c,#101117_72%)]">
          <div className="flex flex-col items-center gap-3 text-white/35">
            <Clapperboard className="h-10 w-10" strokeWidth={1.2} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.32em]">MovieBook</span>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/10" />
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    moviesAPI.getAll()
      .then((response) => {
        if (!active) return;
        const payload = response.data;
        const results = Array.isArray(payload) ? payload : Array.isArray(payload?.movies) ? payload.movies : [];
        setMovies(results);
      })
      .catch((reason: unknown) => {
        console.error('Unable to load the movie catalogue:', reason);
        if (active) setError('We could not reach the movie catalogue. Check your connection and try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryKey]);

  const filteredMovies = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const result = movies.filter((movie) => {
      const title = movie.title || '';
      const description = movie.description || '';
      return (title + ' ' + description).toLocaleLowerCase().includes(query);
    });

    return result.sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'runtime') return (b.duration || 0) - (a.duration || 0);
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [movies, search, sortBy]);

  const heroMovies = movies.length
    ? [movies[1] || movies[0], movies[0], movies[2] || movies[1] || movies[0]]
    : [];

  return (
    <div className="min-h-screen overflow-hidden bg-[#090a0f] text-white selection:bg-orange-400/30 selection:text-white">
      <section className="relative isolate pt-28 sm:pt-32 lg:pt-36">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-40 -top-20 h-[34rem] w-[34rem] rounded-full bg-orange-500/[0.10] blur-[120px]" />
          <div className="absolute -left-40 top-56 h-[26rem] w-[26rem] rounded-full bg-violet-600/[0.09] blur-[110px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-10 lg:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="relative z-10"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-300/[0.07] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Your night, your story
            </div>

            <h1 className="max-w-3xl text-[2.8rem] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-[4.6rem] xl:text-[5.15rem]">
              Great stories.
              <span className="mt-2 block bg-gradient-to-r from-orange-200 via-orange-400 to-rose-400 bg-clip-text pb-2 text-transparent">
                Bigger screens.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
              Find the film you have been waiting for, pick your perfect seats, and make an ordinary evening feel like opening night.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/movies')}
                className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-orange-400 px-6 py-4 text-sm font-bold text-[#15110e] shadow-[0_10px_35px_rgba(249,115,22,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-orange-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300"
              >
                Explore movies
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/showtimes')}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.045] px-6 py-4 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
              >
                <Ticket className="h-4 w-4 text-orange-300" />
                See showtimes
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-white/50 sm:text-sm">
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" /> Pick your own seats</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" /> Clear booking steps</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: 'easeOut' }}
            className="relative mx-auto flex h-[22rem] w-full max-w-[36rem] items-center justify-center sm:h-[31rem] lg:h-[36rem]"
            aria-label="Featured movie posters"
          >
            <div className="absolute h-[19rem] w-[19rem] rounded-full border border-orange-300/10 sm:h-[25rem] sm:w-[25rem]" />
            <div className="absolute h-[15rem] w-[15rem] rounded-full border border-white/[0.06] sm:h-[20rem] sm:w-[20rem]" />
            <div className="absolute h-56 w-56 rounded-full bg-orange-500/10 blur-3xl sm:h-72 sm:w-72" />

            {heroMovies.length > 0 ? (
              heroMovies.map((movie, index) => {
                const positions = [
                  'left-[7%] top-[17%] rotate-[-11deg] scale-[0.83] opacity-65',
                  'left-1/2 top-[5%] z-10 -translate-x-1/2 rotate-[2deg] scale-100',
                  'right-[4%] top-[20%] rotate-[11deg] scale-[0.83] opacity-70',
                ];
                return (
                  <motion.div
                    key={movie.id + '-' + index}
                    className={'group absolute h-[16rem] w-[10.7rem] overflow-hidden rounded-2xl border border-white/15 bg-[#171821] shadow-[0_28px_75px_rgba(0,0,0,0.55)] sm:h-[22rem] sm:w-[14.6rem] ' + positions[index]}
                    animate={index === 1 ? { y: [0, -8, 0] } : { y: [0, index === 0 ? 5 : -4, 0] }}
                    transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <MoviePoster movie={movie} eager={index === 1} />
                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                      <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-orange-200 sm:text-[10px]">Now showing</div>
                      <div className="line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-base">{movie.title}</div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              [0, 1, 2].map((item) => (
                <motion.div
                  key={item}
                  className={'absolute flex h-[16rem] w-[10.7rem] items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[radial-gradient(ellipse_at_20%_20%,rgba(251,146,60,0.3),transparent_45%),linear-gradient(145deg,#282a3b,#11121a)] shadow-[0_28px_75px_rgba(0,0,0,0.55)] sm:h-[22rem] sm:w-[14.6rem] ' + ['left-[7%] top-[17%] rotate-[-11deg] scale-[0.83] opacity-65', 'left-1/2 top-[5%] z-10 -translate-x-1/2 rotate-[2deg]', 'right-[4%] top-[20%] rotate-[11deg] scale-[0.83] opacity-70'][item]}
                >
                  <div className="flex flex-col items-center gap-3 text-white/40">
                    {item === 1 ? <Clapperboard className="h-12 w-12" strokeWidth={1.2} /> : <Film className="h-10 w-10" strokeWidth={1.2} />}
                    <span className="text-[10px] font-semibold uppercase tracking-[0.28em]">MovieBook</span>
                  </div>
                </motion.div>
              ))
            )}

            <div className="absolute bottom-2 right-2 z-20 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#15161e]/90 px-4 py-3 shadow-xl backdrop-blur-xl sm:bottom-5 sm:right-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Book with confidence</p>
                <p className="mt-0.5 text-[11px] text-white/45">A smoother way to movie night</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-5 py-6 sm:grid-cols-3 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3 sm:justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-orange-300"><Ticket className="h-5 w-5" /></div>
            <div><p className="text-sm font-semibold text-white">Your seats, your choice</p><p className="mt-1 text-xs text-white/45">Select the spot you love</p></div>
          </div>
          <div className="flex items-center gap-3 sm:justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-orange-300"><Clock3 className="h-5 w-5" /></div>
            <div><p className="text-sm font-semibold text-white">Plan in a few clicks</p><p className="mt-1 text-xs text-white/45">Browse titles and showtimes</p></div>
          </div>
          <div className="flex items-center gap-3 sm:justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-orange-300"><Popcorn className="h-5 w-5" /></div>
            <div><p className="text-sm font-semibold text-white">Make it a movie night</p><p className="mt-1 text-xs text-white/45">The best part starts here</p></div>
          </div>
        </div>
      </section>

      <section id="movies" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300">
              <span className="h-px w-7 bg-orange-400" /> The collection
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Find your next favourite</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">A quick look at what is in the catalogue. Search a title, explore the details, and choose a showtime.</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <label className="relative flex min-w-0 flex-1 items-center sm:min-w-[17rem] lg:w-72 lg:flex-none">
              <Search className="pointer-events-none absolute left-4 h-4 w-4 text-white/40" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search titles..."
                aria-label="Search movies by title or description"
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-orange-300/60 focus:bg-white/[0.065] focus:ring-2 focus:ring-orange-300/15"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-3 rounded-md p-1 text-white/50 transition hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <label className="flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 text-white/55 focus-within:border-orange-300/60">
              <span className="whitespace-nowrap text-xs">Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                aria-label="Sort movie catalogue"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none sm:min-w-[8rem] [&>option]:bg-[#11131a] [&>option]:text-white"
              >
                <option value="newest">Recently added</option>
                <option value="title">Title A–Z</option>
                <option value="runtime">Longest first</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between border-b border-white/[0.08] pb-4 text-xs text-white/45">
          <span>{loading ? 'Updating the collection…' : error ? 'Collection temporarily unavailable' : filteredMovies.length + ' title' + (filteredMovies.length === 1 ? '' : 's') + ' to explore'}</span>
          <Link to="/movies" className="inline-flex items-center gap-1.5 font-semibold text-orange-300 transition hover:text-orange-200">
            Full catalogue <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 pt-7 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="aspect-[2/3] rounded-2xl bg-white/[0.06]" />
                <div className="mt-4 h-4 w-3/4 rounded bg-white/[0.07]" />
                <div className="mt-2 h-3 w-1/2 rounded bg-white/[0.05]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-300/10 text-orange-300"><Film className="h-6 w-6" /></div>
            <h3 className="mt-5 text-lg font-semibold text-white">The show must go on</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">{error}</p>
            <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#11131a] transition hover:bg-orange-200">Try again</button>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-white/50"><Search className="h-6 w-6" /></div>
            <h3 className="mt-5 text-lg font-semibold text-white">{movies.length ? 'No matching titles' : 'The next feature is on its way'}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">{movies.length ? 'Try another title or clear your search to see the full collection.' : 'There are no movies in the catalogue yet. Check back soon.'}</p>
            {search && <button type="button" onClick={() => setSearch('')} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-300 transition hover:text-orange-200">Clear search <X className="h-4 w-4" /></button>}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 pt-7 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6 xl:grid-cols-5">
            {filteredMovies.map((movie, index) => (
              <motion.article
                key={movie.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.35, delay: Math.min(index % 5, 4) * 0.05 }}
                className="group min-w-0"
              >
                <button
                  type="button"
                  onClick={() => navigate('/showtimes/' + movie.id)}
                  aria-label={'View showtimes for ' + movie.title}
                  className="relative block aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#171821] text-left shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-orange-300/40 hover:shadow-[0_22px_44px_rgba(0,0,0,0.38)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300"
                >
                  <MoviePoster movie={movie} />
                  <div className="absolute left-3 top-3 rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-[10px] font-medium text-white/90 backdrop-blur-md sm:left-4 sm:top-4">
                    {formatDuration(movie.duration)}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-base">{movie.title}</p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-orange-200 sm:text-xs">
                      Choose a showtime <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </button>
                {movie.description && (
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/45 sm:text-sm">{movie.description}</p>
                )}
              </motion.article>
            ))}
          </div>
        )}

        <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-2xl border border-orange-200/15 bg-[radial-gradient(ellipse_at_10%_0%,rgba(251,146,60,0.12),transparent_50%),rgba(255,255,255,0.025)] p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-300/10 text-orange-200"><Ticket className="h-5 w-5" /></div>
            <div>
              <h3 className="text-base font-semibold text-white sm:text-lg">Ready to settle into your seat?</h3>
              <p className="mt-1 text-sm leading-6 text-white/50">Browse all movies and find a showtime that works for you.</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate('/showtimes')} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-300/40 hover:bg-orange-300/10">
            Browse showtimes <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <footer className="border-t border-white/[0.08] bg-[#07080c]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <Link to="/" className="inline-flex items-center gap-3" aria-label="MovieBook home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-400 text-[#15110e]"><Clapperboard className="h-5 w-5" /></span>
            <span><span className="block text-sm font-semibold tracking-wide text-white">MovieBook</span><span className="mt-0.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Make it a movie night</span></span>
          </Link>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-white/45">
            <Link to="/movies" className="transition hover:text-white">Movies</Link>
            <Link to="/showtimes" className="transition hover:text-white">Showtimes</Link>
            <Link to="/my-bookings" className="transition hover:text-white">My bookings</Link>
            <Link to="/login" className="transition hover:text-white">Your account</Link>
          </div>
          <p className="text-xs text-white/35">© {new Date().getFullYear()} MovieBook. Made for movie lovers.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;