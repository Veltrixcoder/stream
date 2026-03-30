import { getPopularMovies, getTrending, getTopRatedMovies, getNowPlaying } from "@/lib/tmdb";
import MediaGrid from "@/components/MediaGrid";
import { Film, Flame, PlayCircle, Star } from 'lucide-react';

export default async function MoviesPage() {
  const [popular, trending, topRated, nowPlaying] = await Promise.all([
    getPopularMovies(),
    getTrending('movie'),
    getTopRatedMovies(),
    getNowPlaying()
  ]);

  return (
    <div className="fade-in">
      <div style={{ padding: '0 0.5rem', marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '4rem', fontWeight: 400, margin: 0 }}>Movies</h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '1.2rem', margin: '1rem 0 0' }}>
          Explore thousands of cinematic titles across all genres.
        </p>
      </div>

      <MediaGrid items={trending} title="Trending This Week" type="movie" icon={Flame} iconColor="#FF6240" />
      <MediaGrid items={nowPlaying} title="In Theaters" type="movie" icon={PlayCircle} iconColor="#E50914" />
      <MediaGrid items={popular} title="Popular Movies" type="movie" icon={Film} iconColor="#8B6FCA" />
      <MediaGrid items={topRated} title="All-Time Classics" type="movie" icon={Star} iconColor="#FFCB45" />
    </div>
  );
}
