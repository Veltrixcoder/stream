'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TMDB_API } from '@/lib/api';
import { Calendar, Star, Clock, Play, ArrowLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function DetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!type || !id) return;
        setLoading(true);
        const data = type === 'movie' 
          ? await TMDB_API.getMovieDetails(id) 
          : await TMDB_API.getTVDetails(id);
        
        if (!data) throw new Error('No data returned from TMDB');
        
        setDetails(data);
        if (type === 'tv' && data.seasons?.length > 0) {
          const firstSeason = data.seasons.find(s => s.season_number === 1) || data.seasons[0];
          setSelectedSeason(firstSeason.season_number);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading details:', err);
        setError('Failed to load content details. Please try again later.');
        setLoading(false);
      }
    };
    loadData();
  }, [type, id]);

  useEffect(() => {
    if (type === 'tv' && id && selectedSeason !== null) {
      const fetchEpisodes = async () => {
        setEpisodesLoading(true);
        try {
          const data = await TMDB_API.getTVSeasonDetails(id, selectedSeason);
          setSeasonData(data);
        } catch (err) {
          console.error('Error loading episodes:', err);
        } finally {
          setEpisodesLoading(false);
        }
      };
      fetchEpisodes();
    }
  }, [type, id, selectedSeason]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => router.back()} className="apple-btn">Go Back</button>
      </div>
    );
  }

  if (!details) return null;

  const backdrop = `https://image.tmdb.org/t/p/original${details.backdrop_path}`;
  const poster = `https://image.tmdb.org/t/p/w500${details.poster_path}`;
  const title = details.title || details.name;
  const year = (details.release_date || details.first_air_date)?.split('-')[0];

  return (
    <div className="details-page fade-in">
      <button onClick={() => router.back()} className="back-btn-float glass">
        <ArrowLeft size={24} />
      </button>

      <div className="details-hero">
        <div className="details-backdrop">
          <img src={backdrop} alt={title} />
          <div className="backdrop-overlay"></div>
        </div>

        <div className="details-content-main">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="details-poster-container"
          >
            <img src={poster} alt={title} className="details-poster" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="details-info-container"
          >
            <h1 className="details-title">{title}</h1>
            
            <div className="details-meta-row">
              <div className="meta-badge">
                <Calendar size={14} /> {year}
              </div>
              <div className="meta-badge accent">
                <Star size={14} fill="currentColor" /> {details.vote_average?.toFixed(1)}
              </div>
              {details.runtime && (
                <div className="meta-badge">
                  <Clock size={14} /> {details.runtime} min
                </div>
              )}
            </div>

            <div className="details-genres">
              {details.genres?.map(g => (
                <span key={g.id} className="genre-tag">{g.name}</span>
              ))}
            </div>

            <p className="details-overview">{details.overview}</p>

            {type === 'movie' && (
              <div className="details-actions">
                <button 
                  onClick={() => router.push(`/watch?type=movie&id=${id}`)}
                  className="play-btn-large"
                >
                  <Play size={20} fill="currentColor" /> Watch Movie
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {type === 'tv' && (
        <div className="episodes-section">
          <div className="section-title-row">
            <LayoutGrid size={24} color="var(--accent)" />
            <h2>Episodes</h2>
          </div>

          <div className="seasons-tabs-container horizontal-scroll">
            {details.seasons?.filter(s => s.season_number > 0).map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSeason(s.season_number)}
                className={`season-tab ${selectedSeason === s.season_number ? 'active' : ''}`}
              >
                Season {s.season_number}
              </button>
            ))}
          </div>

          <div className="episodes-grid">
            <AnimatePresence mode="wait">
              {episodesLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="episodes-loader"
                >
                  <div className="spinner-small"></div>
                  <span>Loading Season {selectedSeason}...</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="episodes-list"
                >
                  {seasonData?.episodes?.map((ep) => (
                    <div 
                      key={ep.id} 
                      className="episode-card glass-card"
                      onClick={() => router.push(`/watch?type=tv&id=${id}&s=${selectedSeason}&e=${ep.episode_number}`)}
                    >
                      <div className="episode-thumb">
                        {ep.still_path ? (
                          <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} alt={ep.name} />
                        ) : (
                          <div className="episode-placeholder"><Play size={32} /></div>
                        )}
                        <div className="ep-badge">E{ep.episode_number}</div>
                      </div>
                      <div className="episode-info">
                        <h3>{ep.name}</h3>
                        <p>{ep.overview?.slice(0, 80) || 'No description available.'}...</p>
                      </div>
                      <div className="ep-play-icon">
                        <Play size={20} fill="currentColor" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={<div className="loading-container"><div className="spinner"></div></div>}>
      <DetailsContent />
    </Suspense>
  );
}
