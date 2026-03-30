import { 
  getTrending, 
  getPopularMovies, 
  getPopularTv, 
  getTopRatedMovies, 
  getNowPlaying, 
  getAnime 
} from "@/lib/tmdb";
import Hero from "@/components/Hero";
import MediaGrid from "@/components/MediaGrid";
import { Flame, PlayCircle, Film, Tv, Star, Sparkles } from 'lucide-react';

export default async function Home() {
  const [
    trending, 
    popularMovies, 
    popularTv, 
    topRated, 
    nowPlaying,
    anime
  ] = await Promise.all([
    getTrending('all'),
    getPopularMovies(),
    getPopularTv(),
    getTopRatedMovies(),
    getNowPlaying(),
    getAnime()
  ]);

  return (
    <div className="fade-in">
      <Hero items={trending.slice(0, 5)} />
      
      <MediaGrid 
        items={trending} 
        title="Trending Now" 
        type="movie" 
        icon={Flame} 
        iconColor="#FF6240" 
      />
      
      <MediaGrid 
        items={nowPlaying} 
        title="Now Playing" 
        type="movie" 
        icon={PlayCircle} 
        iconColor="#E50914" 
      />
      
      <MediaGrid 
        items={popularMovies} 
        title="Popular Movies" 
        type="movie" 
        icon={Film} 
        iconColor="#8B6FCA" 
      />
      
      <MediaGrid 
        items={popularTv} 
        title="Popular Series" 
        type="tv" 
        icon={Tv} 
        iconColor="#4A90E2" 
      />
      
      <MediaGrid 
        items={topRated} 
        title="Top Rated" 
        type="movie" 
        icon={Star} 
        iconColor="#FFCB45" 
      />
      
      <MediaGrid 
        items={anime} 
        title="Anime Hits" 
        type="tv" 
        icon={Sparkles} 
        iconColor="#FF8C42" 
      />
    </div>
  );
}
