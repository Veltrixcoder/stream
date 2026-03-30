import { getTrending, getPopularMovies, getPopularTv } from "@/lib/tmdb";
import Hero from "@/components/Hero";
import MediaGrid from "@/components/MediaGrid";

export default async function Home() {
  const [trending, popularMovies, popularTv] = await Promise.all([
    getTrending('all'),
    getPopularMovies(),
    getPopularTv()
  ]);

  const featured = trending[0];

  return (
    <div className="fade-in">
      <Hero media={featured} />
      
      <MediaGrid items={popularMovies.slice(0, 10)} title="Popular Movies" type="movie" />
      <MediaGrid items={popularTv.slice(0, 10)} title="Trending TV Shows" type="tv" />
      <MediaGrid items={trending.slice(1, 11)} title="Discover More" type="movie" />
    </div>
  );
}
