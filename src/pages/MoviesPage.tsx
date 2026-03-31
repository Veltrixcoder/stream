import { useState, useEffect } from 'react';
import { getPopularMovies, getTrending, Media } from "@/lib/tmdb";
import MediaGrid from "@/components/MediaGrid";

export default function MoviesPage() {
  const [data, setData] = useState<{
    popular: Media[];
    trending: Media[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [popular, trending] = await Promise.all([
          getPopularMovies(),
          getTrending('movie')
        ]);
        setData({ popular, trending });
      } catch (error) {
        console.error("Failed to fetch movies data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !data) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>Movies</h1>
      <MediaGrid items={data.trending} title="Trending This Week" type="movie" />
      <MediaGrid items={data.popular} title="Popular Movies" type="movie" />
    </div>
  );
}
