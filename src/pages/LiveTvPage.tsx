import { useState, useEffect } from 'react';
import { getPopularTv, getTrending, Media } from "@/lib/tmdb";
import MediaGrid from "@/components/MediaGrid";

export default function LiveTvPage() {
  const [data, setData] = useState<{
    popular: Media[];
    trending: Media[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [popular, trending] = await Promise.all([
          getPopularTv(),
          getTrending('tv')
        ]);
        setData({ popular, trending });
      } catch (error) {
        console.error("Failed to fetch TV data:", error);
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
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>Live TV</h1>
      <MediaGrid items={data.trending} title="Trending TV Shows" type="tv" />
      <MediaGrid items={data.popular} title="Popular on Air" type="tv" />
    </div>
  );
}
