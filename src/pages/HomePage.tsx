import { useState, useEffect } from 'react';
import { getTrending, getPopularMovies, getPopularTv, Media } from "@/lib/tmdb";
import Hero from "@/components/Hero";
import MediaGrid from "@/components/MediaGrid";

export default function HomePage() {
  const [data, setData] = useState<{
    trending: Media[];
    popularMovies: Media[];
    popularTv: Media[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [trending, popularMovies, popularTv] = await Promise.all([
          getTrending('all'),
          getPopularMovies(),
          getPopularTv()
        ]);
        setData({ trending, popularMovies, popularTv });
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !data) {
    return <div className="loading">Loading...</div>;
  }

  const featured = data.trending[0];

  return (
    <div className="fade-in">
      <Hero media={featured} />
      
      <MediaGrid items={data.popularMovies.slice(0, 10)} title="Popular Movies" type="movie" />
      <MediaGrid items={data.popularTv.slice(0, 10)} title="Trending TV Shows" type="tv" />
      <MediaGrid items={data.trending.slice(1, 11)} title="Discover More" type="movie" />
    </div>
  );
}
