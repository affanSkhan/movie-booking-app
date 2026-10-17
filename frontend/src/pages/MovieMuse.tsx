import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BrainCircuit, CheckCircle2, Clapperboard, Clock3, Film,
  Heart, Lightbulb, RefreshCw, Search, Sparkles, WandSparkles,
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
interface MoodRule { id: string; label: string; prompts: string[]; hints: string[]; }

const moodRules: MoodRule[] = [
  { id: 'mind-bending', label: 'Mind-bending', prompts: ['mind bending','mind-bending','twist','puzzle','think','reality','dream','sci-fi','science fiction','space','time travel','future','cosmic'], hints: ['space','wormhole','simulation','dream','reality','time','machine','future','science','memory','dimension','alien','universe','inception','matrix','interstellar','arrival','dune'] },
  { id: 'thrilling', label: 'Thrilling', prompts: ['thriller','thrilling','intense','edge of my seat','suspense','crime','dark','action','adrenaline','fast paced','fast-paced','fight','heist'], hints: ['crime','thief','secrets','joker','batman','fight','battle','war','mission','chase','gangster','danger','revenge','dark knight','pulp fiction','oppenheimer'] },
  { id: 'uplifting', label: 'Uplifting', prompts: ['uplifting','inspiring','inspirational','feel good','feel-good','hope','motivating','comfort','happy','heartwarming','heart-warming','positive'], hints: ['friendship','hope','redemption','survival','kindness','life','journey','family','inspire','dream','forrest gump','shawshank','three idiots','3 idiots','dangal'] },
  { id: 'funny', label: 'Funny', prompts: ['funny','comedy','laugh','laughs','lighthearted','light-hearted','silly','cheerful','quirky'], hints: ['comedy','funny','humor','school','friends','mario','barbie','idiots','adventure','fun'] },
  { id: 'romantic', label: 'Romantic', prompts: ['romance','romantic','love story','love','date night','date-night','relationship','emotional romance'], hints: ['love','romance','relationship','couple','heart','la la land','sita ramam','barbie'] },
  { id: 'family', label: 'Family night', prompts: ['family','kids','children','family friendly','family-friendly','animation','animated','cartoon','watch with parents'], hints: ['family','animated','animation','friendship','mario','inside out','coco','adventure','magic'] },
  { id: 'epic', label: 'Epic adventure', prompts: ['epic','adventure','fantasy','big world','world building','war','hero','heroes','space opera'], hints: ['journey','middle-earth','ring','kingdom','space','battle','war','adventure','dune','lord of the rings','avatar','guardians','superhero'] },
  { id: 'emotional', label: 'Emotional', prompts: ['emotional','moving','tearjerker','tear jerker','sad','deep','thoughtful','meaningful','powerful drama'], hints: ['life','friendship','family','loss','redemption','prison','journey','history','love','human','forrest gump','shawshank','whiplash'] },
];

const tokenize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((word) => word.length > 2 && !['the','and','with','that','for','under','over','want','something','movie','film','watch','please','about','from','this','some','have','into','just'].includes(word));
const getRuntimeLimit = (prompt: string) => {
  const normalized = prompt.toLowerCase();
  const unitMatch = normalized.match(/(?:under|below|less than|max(?:imum)?|at most|within)\s+(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m)\b/);
  if (unitMatch) {
    const amount = Number(unitMatch[1]);
    return /h|hour|hr/.test(unitMatch[2]) ? amount * 60 : amount;
  }
  const compactMatch = normalized.match(/(?:under|below|less than|at most)\s+(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/);
  if (compactMatch) return Number(compactMatch[1]) * 60;
  if (/short movie|short film|quick watch|not too long|something short/.test(normalized)) return 120;
  return null;
};

const getRecommendations = (movies: Movie[], prompt: string) => {
  const normalized = prompt.toLowerCase();
  const promptTokens = tokenize(normalized);
  const matchedMoods = moodRules.filter((rule) => rule.prompts.some((phrase) => normalized.includes(phrase)));
  const runtimeLimit = getRuntimeLimit(normalized);

  return movies.map((movie) => {
    const text = ((movie.title || '') + ' ' + (movie.description || '')).toLowerCase();
    let score = 0;
    promptTokens.forEach((token) => { if (text.includes(token)) score += token.length > 5 ? 2.5 : 1.5; });
    const matchedLabels: string[] = [];
    matchedMoods.forEach((mood) => {
      const hits = mood.hints.filter((hint) => text.includes(hint)).length;
      if (hits) {
        score += Math.min(hits, 4) * 2.25;
        matchedLabels.push(mood.label.toLowerCase());
      }
    });
    const withinRuntime = !runtimeLimit || !movie.duration || movie.duration <= runtimeLimit;
    if (runtimeLimit && !withinRuntime) score -= 100;
    if (runtimeLimit && movie.duration && withinRuntime) score += 1.5;
    return { movie, score, withinRuntime, matchedLabels, runtimeLimit };
  }).filter((item) => item.withinRuntime && item.score > 0)
    .sort((a, b) => b.score - a.score || a.movie.title.localeCompare(b.movie.title))
    .slice(0, 6)
    .map((item) => {
      const why = item.matchedLabels.length
        ? 'Matches your ' + Array.from(new Set(item.matchedLabels)).slice(0, 2).join(' + ') + ' vibe'
        : item.runtimeLimit && item.movie.duration
          ? 'Fits your runtime and overlaps with your description'
          : 'A close match from the movie title and plot details';
      return { ...item, why };
    });
};

const formatDuration = (minutes?: number) => {
  if (!minutes) return 'Runtime not listed';
  return Math.floor(minutes / 60) + 'h' + (minutes % 60 ? ' ' + (minutes % 60) + 'm' : '');
};

const prompts = [
  'Mind-bending sci-fi under 2 hours',
  'Something uplifting for a tough day',
  'A thrilling, intense movie night',
  'A fun film for the whole family',
  'An emotional story with meaning',
];

const MovieMuse: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [prompt, setPrompt] = useState('');
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

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
        console.error('Movie Muse could not load the catalogue:', reason);
        if (active) setError('Movie Muse needs the current catalogue to make recommendations. Try again when the service is available.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  const results = useMemo(() => submittedPrompt ? getRecommendations(movies, submittedPrompt) : [], [movies, submittedPrompt]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = prompt.trim();
    if (next.length < 3) return;
    setSubmittedPrompt(next);
  };

  return (
    <div className="min-h-screen bg-background pb-16 pt-28 text-foreground sm:pt-32">
      <section className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-orange-500/[0.12] via-card to-fuchsia-500/[0.06] p-6 sm:p-9 lg:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/[0.08] blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-primary"><WandSparkles className="h-4 w-4" /> Movie Muse · smart discovery</div>
            <h1 className="text-4xl font-black leading-[1.05] tracking-[-.04em] sm:text-5xl lg:text-6xl">Tell us the vibe.<span className="mt-1 block bg-gradient-to-r from-orange-500 via-amber-500 to-fuchsia-500 bg-clip-text text-transparent">We’ll find the film.</span></h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">Describe your mood, favourite genres, who you’re watching with, or how much time you have. Movie Muse matches your prompt against the actual MovieBook catalogue and explains why each pick fits.</p>
            <form onSubmit={submit} className="mt-7 rounded-2xl border border-border bg-card/90 p-3 shadow-lg shadow-orange-950/[0.04] backdrop-blur sm:p-4">
              <label htmlFor="movie-muse-prompt" className="sr-only">Describe the movie you want to watch</label>
              <textarea id="movie-muse-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} maxLength={500} placeholder="e.g. I want a mind-bending sci-fi movie under 2 hours, or something uplifting to watch with family…" className="w-full resize-y bg-transparent px-2 py-1 text-sm leading-6 outline-none placeholder:text-muted-foreground sm:text-base" />
              <div className="flex flex-col gap-3 border-t border-border px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[11px] text-muted-foreground">{prompt.length}/500 characters</span>
                <button type="submit" disabled={loading || prompt.trim().length < 3} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"><Sparkles className="h-4 w-4" /> Find my movie</button>
              </div>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="mr-1 inline-flex items-center gap-1.5 self-center text-xs font-bold text-muted-foreground"><Lightbulb className="h-3.5 w-3.5" /> Try a prompt</span>
              {prompts.map((sample) => <button key={sample} type="button" onClick={() => { setPrompt(sample); setSubmittedPrompt(sample); }} className="rounded-full border border-border bg-card/70 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-foreground">{sample}</button>)}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="flex gap-3 rounded-2xl border border-border bg-card p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><BrainCircuit className="h-5 w-5" /></span><div><p className="text-sm font-extrabold">Prompt understanding</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Mood, genre and runtime cues guide the shortlist.</p></div></div>
          <div className="flex gap-3 rounded-2xl border border-border bg-card p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500"><Heart className="h-5 w-5" /></span><div><p className="text-sm font-extrabold">Made for your moment</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Recommendations reflect what you describe.</p></div></div>
          <div className="flex gap-3 rounded-2xl border border-border bg-card p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></span><div><p className="text-sm font-extrabold">No API key needed</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Matching runs inside the app using catalogue metadata.</p></div></div>
        </div>

        {loading ? (
          <div className="py-16 text-center"><span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /><p className="mt-4 text-sm text-muted-foreground">Loading the MovieBook catalogue…</p></div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center"><Film className="mx-auto h-8 w-8 text-primary" /><p className="mt-3 font-extrabold">Movie Muse is taking a breather</p><p className="mt-2 text-sm text-muted-foreground">{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"><RefreshCw className="h-4 w-4" /> Try again</button></div>
        ) : submittedPrompt ? (
          <section className="mt-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-primary">Your personalised shortlist</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Picked for your vibe</h2><p className="mt-2 text-sm text-muted-foreground">Prompt: “{submittedPrompt}”</p></div>
              <button type="button" onClick={() => { setSubmittedPrompt(''); setPrompt(''); }} className="inline-flex items-center gap-2 self-start rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground sm:self-auto"><RefreshCw className="h-4 w-4" /> Start over</button>
            </div>
            {results.length ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((result, index) => (
                  <motion.article key={result.movie.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28, delay: index * .04 }} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <button type="button" onClick={() => navigate('/showtimes/' + result.movie.id)} className="group relative flex w-full gap-4 p-4 text-left" aria-label={'Find showtimes for ' + result.movie.title}>
                      <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                        {result.movie.poster_url ? <img src={result.movie.poster_url} alt={result.movie.title + ' poster'} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} /> : <div className="flex h-full items-center justify-center text-white/40"><Clapperboard className="h-7 w-7" /></div>}
                        <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-extrabold text-white">#{index + 1} MATCH</span>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="line-clamp-3 text-base font-extrabold leading-snug">{result.movie.title}</h3>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Clock3 className="h-3.5 w-3.5 text-primary" />{formatDuration(result.movie.duration)}</p>
                        <p className="mt-3 line-clamp-4 text-xs leading-5 text-muted-foreground">{result.movie.description || 'Explore this title from the MovieBook catalogue.'}</p>
                        <div className="mt-auto pt-4"><span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary">Find showtimes <ArrowRight className="h-3.5 w-3.5" /></span></div>
                      </div>
                    </button>
                    <div className="border-t border-border bg-primary/[0.045] px-4 py-3"><p className="text-xs font-bold text-primary"><Sparkles className="mr-1.5 inline h-3.5 w-3.5" />{result.why}</p></div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center"><Search className="mx-auto h-8 w-8 text-muted-foreground" /><h3 className="mt-3 text-lg font-extrabold">No strong matches yet</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Try a broader mood or genre like “sci-fi”, “thriller”, “uplifting”, “comedy”, or “family movie night”. You can also relax the runtime limit.</p><button type="button" onClick={() => { setPrompt('Something adventurous and uplifting'); setSubmittedPrompt('Something adventurous and uplifting'); }} className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Try a broader prompt</button></div>
            )}
          </section>
        ) : (
          <div className="py-14 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary"><Sparkles className="h-6 w-6" /></div><h2 className="mt-5 text-xl font-extrabold">Your next favourite is in the details</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Share what you’re in the mood for to get up to six picks, with a short explanation for each match.</p></div>
        )}
        <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="font-extrabold">Want to browse for yourself?</p><p className="mt-1 text-sm text-muted-foreground">Explore the full catalogue or see the latest screening schedule.</p></div><div className="flex flex-wrap gap-2"><Link to="/movies" className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold">All movies</Link><Link to="/showtimes" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Showtimes</Link></div></div>
      </section>
    </div>
  );
};

export default MovieMuse;
