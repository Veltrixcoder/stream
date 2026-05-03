'use client';
import { useState, useEffect } from 'react';
import { TMDB_API } from '@/lib/api';
import MediaCard from '@/components/MediaCard';
import { Play, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const [data, setData] = useState({
    trending: [],
    nowPlaying: [],
    popular: [],
    anime: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [trending, nowPlaying, popular, anime] = await Promise.all([
          TMDB_API.getTrending('movie'),
          TMDB_API.getNowPlayingMovies(),
          TMDB_API.getPopularMovies(),
          TMDB_API.getAnimeMovies(),
        ]);
        setData({
          trending: trending.results || [],
          nowPlaying: nowPlaying.results || [],
          popular: popular.results || [],
          anime: anime.results || []
        });
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const heroMovie = data.trending.length > 0 ? data.trending[0] : null;

  return (
    <div className="home-page fade-up">
      <header className="home-header">
        <div className="header-top">
          <h1 className="text-gradient">Discover Movies</h1>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loading-container"
          >
            <div className="spinner"></div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="content-stack"
          >
            {heroMovie && (
              <section className="hero-section">
                <div className="hero-card apple-card">
                  <img 
                    src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`} 
                    alt={heroMovie.title}
                    className="hero-image"
                  />
                  <div className="hero-overlay">
                    <span className="section-eyebrow">Featured</span>
                    <h2>{heroMovie.title}</h2>
                    <p>{heroMovie.overview?.slice(0, 150)}...</p>
                    <div className="hero-actions">
                      <Link href={`/watch/movie/${heroMovie.id}`} className="apple-btn apple-btn-primary">
                        <Play size={18} fill="currentColor" /> Play Now
                      </Link>
                      <button className="apple-btn apple-btn-secondary">
                        <Info size={18} /> Details
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="content-section">
              <div className="section-header">
                <h3>Trending Now</h3>
                <Link href="/search" className="view-all">View All <ChevronRight size={16} /></Link>
              </div>
              <div className="horizontal-scroll">
                {data.trending.slice(1).map((item) => (
                  <MediaCard key={item.id} item={item} type="movie" />
                ))}
              </div>
            </section>

            <section className="content-section">
              <div className="section-header">
                <h3>Now Playing</h3>
                <Link href="/search" className="view-all">View All <ChevronRight size={16} /></Link>
              </div>
              <div className="horizontal-scroll">
                {data.nowPlaying.map((item) => (
                  <MediaCard key={item.id} item={item} type="movie" />
                ))}
              </div>
            </section>

            <section className="content-section">
              <div className="section-header">
                <h3>Popular Movies</h3>
                <Link href="/search" className="view-all">View All <ChevronRight size={16} /></Link>
              </div>
              <div className="horizontal-scroll">
                {data.popular.map((item) => (
                  <MediaCard key={item.id} item={item} type="movie" />
                ))}
              </div>
            </section>

            <section className="content-section">
              <div className="section-header">
                <h3>Anime Hits</h3>
                <Link href="/search" className="view-all">View All <ChevronRight size={16} /></Link>
              </div>
              <div className="horizontal-scroll">
                {data.anime.map((item) => (
                  <MediaCard key={item.id} item={item} type="movie" />
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

