import { getPopularTv, getTrending, getTopRatedTv, getAnime } from "@/lib/tmdb";
import MediaGrid from "@/components/MediaGrid";
import { Tv, Flame, Star, Sparkles } from 'lucide-react';

export default async function LiveTvPage() {
  const [popular, trending, topRated, anime] = await Promise.all([
    getPopularTv(),
    getTrending('tv'),
    getTopRatedTv(),
    getAnime()
  ]);

  return (
    <div className="fade-in">
      <div style={{ padding: '0 0.5rem', marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '4rem', fontWeight: 400, margin: 0 }}>TV Shows</h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '1.2rem', margin: '1rem 0 0' }}>
          Explore trending series and timeless television.
        </p>
      </div>

      <MediaGrid items={trending} title="Trending TV Shows" type="tv" icon={Flame} iconColor="#FF6240" />
      <MediaGrid items={popular} title="Popular on Air" type="tv" icon={Tv} iconColor="#4A90E2" />
      <MediaGrid items={topRated} title="Top Rated Series" type="tv" icon={Star} iconColor="#FFCB45" />
      <MediaGrid items={anime} title="Anime Series" type="tv" icon={Sparkles} iconColor="#FF8C42" />
    </div>
  );
}
