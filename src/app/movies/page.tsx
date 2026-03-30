import { getPopularMovies, getTrending } from "@/lib/tmdb";
import MediaGrid from "@/components/MediaGrid";

export default async function MoviesPage() {
  const [popular, trending] = await Promise.all([
    getPopularMovies(),
    getTrending('movie')
  ]);

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>Movies</h1>
      <MediaGrid items={trending} title="Trending This Week" type="movie" />
      <MediaGrid items={popular} title="Popular Movies" type="movie" />
    </div>
  );
}
