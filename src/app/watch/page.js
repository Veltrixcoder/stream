'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { TMDB_API, STREAM_API, SOURCES, formatProxyUrl } from '@/lib/api';
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), { ssr: false });
import { Calendar, Star, Clock, Server, Loader2, ArrowLeft } from 'lucide-react';

function WatchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const sParam = searchParams.get('s');
  const eParam = searchParams.get('e');

  const [details, setDetails] = useState(null);
  const [sources, setSources] = useState([]);
  const [currentSource, setCurrentSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streamingLoading, setStreamingLoading] = useState(false);
  const [currentServerIdx, setCurrentServerIdx] = useState(0);
  const [season, setSeason] = useState(parseInt(sParam) || 1);
  const [episode, setEpisode] = useState(parseInt(eParam) || 1);
  const [mounted, setMounted] = useState(false);
  const player = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchStream = async (serverIdx, s = season, e = episode) => {
    setStreamingLoading(true);
    setCurrentServerIdx(serverIdx);
    setCurrentSource(null);
    try {
      const data = await STREAM_API.getSources(
        SOURCES[serverIdx], type, id, 
        type === 'tv' ? s : undefined, 
        type === 'tv' ? e : undefined
      );
      if (data && data.length > 0) {
        setSources(data);
        setCurrentSource(data[0]);
      } else {
        tryNextServer(serverIdx, s, e);
      }
    } catch (err) {
      tryNextServer(serverIdx, s, e);
    } finally {
      setStreamingLoading(false);
    }
  };

  const tryNextServer = async (serverIdx = currentServerIdx, s = season, e = episode) => {
    const nextIdx = serverIdx + 1;
    if (nextIdx >= SOURCES.length) {
      console.error("All servers exhausted.");
      setStreamingLoading(false);
      setCurrentSource(null);
      return;
    }

    setStreamingLoading(true);
    setCurrentServerIdx(nextIdx);
    
    try {
      const data = await STREAM_API.getSources(
        SOURCES[nextIdx], type, id, 
        type === 'tv' ? s : undefined, 
        type === 'tv' ? e : undefined
      );
      if (data && data.length > 0) {
        setSources(data);
        setCurrentSource(data[0]);
      } else {
        tryNextServer(nextIdx, s, e);
      }
    } catch (err) {
      tryNextServer(nextIdx, s, e);
    } finally {
      setStreamingLoading(false);
    }
  };

  const manualServerSwitch = (serverIdx) => {
    if (serverIdx === currentServerIdx) return;
    fetchStream(serverIdx, season, episode);
  };

  const handleEpisodeChange = (newSeason, newEpisode) => {
    setSeason(newSeason);
    setEpisode(newEpisode);
    fetchStream(currentServerIdx, newSeason, newEpisode);
    
    // Update URL without refreshing the page
    const params = new URLSearchParams(window.location.search);
    params.set('s', newSeason);
    params.set('e', newEpisode);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (!type || !id) return;
    const loadData = async () => {
      try {
        const detailsData = type === 'movie' 
          ? await TMDB_API.getMovieDetails(id) 
          : await TMDB_API.getTVDetails(id);
        
        setDetails(detailsData);
        setLoading(false);
        fetchStream(0, season, episode);

        const history = JSON.parse(localStorage.getItem('luxa_history') || '[]');
        const newItem = {
          id, type, title: detailsData.title || detailsData.name,
          image: detailsData.poster_path, timestamp: new Date().getTime()
        };
        localStorage.setItem('luxa_history', JSON.stringify([newItem, ...history.filter(item => item.id !== id)].slice(0, 20)));

      } catch (error) {
        console.error('Error loading watch data:', error);
        setLoading(false);
      }
    };
    loadData();
  }, [type, id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="watch-page fade-in">
      <button onClick={() => router.back()} className="back-btn-float glass">
        <ArrowLeft size={24} />
      </button>

      <div className="player-container glass">
        {mounted && currentSource && !streamingLoading ? (
          <VideoPlayer 
            src={formatProxyUrl(currentSource.url)}
            title={details?.title || details?.name}
            poster={`https://image.tmdb.org/t/p/original${details?.backdrop_path}`}
          />
        ) : mounted && !streamingLoading && !currentSource ? (
          <div className="no-source">
            <p>No streams available. Please try another server or check back later.</p>
          </div>
        ) : (
          <div className="streaming-loader">
            <Loader2 className="spin" size={48} color="var(--accent)" />
            <p>Fetching media...</p>
          </div>
        )}
      </div>

      <div className="content-details">
        <div className="main-info">
          <h1>{details?.title || details?.name}</h1>
          
          {type === 'tv' && details?.seasons && (
            <div className="tv-controls" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <select 
                value={season} 
                onChange={(e) => {
                  const newSeason = parseInt(e.target.value);
                  handleEpisodeChange(newSeason, 1);
                }}
                className="glass"
                style={{ padding: '12px 20px', borderRadius: '14px', background: 'var(--glass)', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', cursor: 'pointer', fontWeight: '600' }}
              >
                {details.seasons.filter(s => s.season_number > 0).map(s => (
                  <option key={s.season_number} value={s.season_number} style={{ background: '#111' }}>
                    Season {s.season_number}
                  </option>
                ))}
              </select>

              <select 
                value={episode} 
                onChange={(e) => handleEpisodeChange(season, parseInt(e.target.value))}
                className="glass"
                style={{ padding: '12px 20px', borderRadius: '14px', background: 'var(--glass)', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', cursor: 'pointer', fontWeight: '600' }}
              >
                {Array.from({ length: details.seasons.find(s => s.season_number === season)?.episode_count || 1 }).map((_, i) => (
                  <option key={i + 1} value={i + 1} style={{ background: '#111' }}>
                    Episode {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="meta-row">
            <div className="meta-item">
              <Calendar size={16} />
              <span>{(details?.release_date || details?.first_air_date)?.split('-')[0]}</span>
            </div>
            <div className="meta-item">
              <Star size={16} fill="var(--accent)" color="var(--accent)" />
              <span>{details?.vote_average?.toFixed(1)}</span>
            </div>
            {details?.runtime && (
              <div className="meta-item">
                <Clock size={16} />
                <span>{details.runtime} min</span>
              </div>
            )}
          </div>
          <p className="overview">{details?.overview}</p>
        </div>

        <div className="side-panel">
          <div className="sources-list glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={20} /> Select Server
            </h3>
            <div className="source-buttons">
              {SOURCES.map((sourceId, index) => (
                <button 
                  key={sourceId}
                  className={currentServerIdx === index ? 'active' : ''}
                  onClick={() => manualServerSwitch(index)}
                  style={{ width: '100%' }}
                >
                  Server {index + 1} {currentServerIdx === index ? '(Active)' : ''}
                </button>
              ))}
            </div>

            {sources.length > 1 && (
              <>
                <h3 style={{ fontSize: '16px', marginTop: '24px', marginBottom: '12px', color: 'var(--text-dim)' }}>
                  Quality Links
                </h3>
                <div className="source-buttons">
                  {sources.map((source, index) => (
                    <button 
                      key={index}
                      className={currentSource?.url === source.url ? 'active' : ''}
                      onClick={() => setCurrentSource(source)}
                      style={{ fontSize: '12px', padding: '8px 12px' }}
                    >
                      {source.quality}p - Link {index + 1}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="loading-container"><div className="spinner"></div></div>}>
      <WatchContent />
    </Suspense>
  );
}
