import { getPopularTv, getTrending } from "@/lib/tmdb";
import MediaGrid from "@/components/MediaGrid";

export default async function LiveTvPage() {
  const [popular, trending] = await Promise.all([
    getPopularTv(),
    getTrending('tv')
  ]);

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>Live TV</h1>
      <MediaGrid items={trending} title="Trending TV Shows" type="tv" />
      <MediaGrid items={popular} title="Popular on Air" type="tv" />
    </div>
  );
}
