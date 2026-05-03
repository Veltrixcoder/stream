'use client';
import { useState, useEffect } from 'react';
import { TMDB_API } from '@/lib/api';
import MediaCard from '@/components/MediaCard';
import { Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function TVPage() {
  const [data, setData] = useState({
    trending: [],
    airingToday: [],
    topRated: [],
    popular: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [trending, airingToday, topRated, popular] = await Promise.all([
          TMDB_API.getTrending('tv'),
          TMDB_API.getAiringTodayTV(),
          TMDB_API.getTopRatedTV(),
          TMDB_API.getPopularTV(),
        ]);
        setData({
          trending: trending.results || [],
          airingToday: airingToday.results || [],
          topRated: topRated.results || [],
          popular: popular.results || []
        });
      } catch (error) {
        console.error('Error loading TV data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="tv-page fade-up">
      <header className="page-header">
        <div className="header-top">
          <h1 className="text-gradient">TV Series</h1>
          <Link href="/search" className="search-trigger glass">
            <Search size={18} />
            <span>Search shows...</span>
          </Link>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="content-stack">
            <section className="content-section">
              <div className="section-header">
                <h3>Trending Shows</h3>
                <Link href="/search" className="view-all">View All <ChevronRight size={16} /></Link>
              </div>
              <div className="horizontal-scroll">
                {data.trending.map((item) => (
                  <MediaCard key={item.id} item={item} type="tv" />
                ))}
              </div>
            </section>

            <section className="content-section">
              <div className="section-header">
                <h3>Airing Today</h3>
                <Link href="/search" className="view-all">View All <ChevronRight size={16} /></Link>
              </div>
              <div className="horizontal-scroll">
                {data.airingToday.map((item) => (
                  <MediaCard key={item.id} item={item} type="tv" />
                ))}
              </div>
            </section>

            <section className="content-section">
              <div className="section-header">
                <h3>All Time Best</h3>
                <Link href="/search" className="view-all">View All <ChevronRight size={16} /></Link>
              </div>
              <div className="horizontal-scroll">
                {data.topRated.map((item) => (
                  <MediaCard key={item.id} item={item} type="tv" />
                ))}
              </div>
            </section>

            <section className="content-section">
              <div className="section-header">
                <h3>Popular Now</h3>
                <Link href="/search" className="view-all">View All <ChevronRight size={16} /></Link>
              </div>
              <div className="horizontal-scroll">
                {data.popular.map((item) => (
                  <MediaCard key={item.id} item={item} type="tv" />
                ))}
              </div>
            </section>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
