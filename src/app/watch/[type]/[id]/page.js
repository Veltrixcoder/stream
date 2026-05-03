'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { TMDB_API, STREAM_API, SOURCES, formatProxyUrl } from '@/lib/api';
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { Calendar, Star, Clock, Server, Loader2 } from 'lucide-react';

export default function WatchPage() {
  const { type, id } = useParams();
  const [details, setDetails] = useState(null);
  const [sources, setSources] = useState([]);
  const [currentSource, setCurrentSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streamingLoading, setStreamingLoading] = useState(false);
  const [currentServerIdx, setCurrentServerIdx] = useState(0);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const player = useRef(null);

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

  // Automatically skips to the next server provider if the current one fails
  const tryNextServer = async (serverIdx = currentServerIdx, s = season, e = episode) => {
    const nextIdx = serverIdx + 1;
    if (nextIdx >= SOURCES.length) {
      console.error("All servers exhausted.");
      setStreamingLoading(false);
      setCurrentSource(null);
      return;
    }

    console.log(`Server ${SOURCES[serverIdx]} failed. Switching to Server ${SOURCES[nextIdx]}...`);
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
      console.error(`Server ${SOURCES[nextIdx]} API failed, trying next...`);
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
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const detailsData = type === 'movie' 
          ? await TMDB_API.getMovieDetails(id) 
          : await TMDB_API.getTVDetails(id);
        
        setDetails(detailsData);
        setLoading(false);

        // Start fallback from first source
        fetchStream(0, 1, 1);

        // Save to History
        const history = JSON.parse(localStorage.getItem('drishya_history') || '[]');
        const newItem = {
          id, type, title: detailsData.title || detailsData.name,
          image: detailsData.poster_path, timestamp: new Date().getTime()
        };
        localStorage.setItem('drishya_history', JSON.stringify([newItem, ...history.filter(item => item.id !== id)].slice(0, 20)));

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
      <div className="player-container glass">
        {currentSource && !streamingLoading ? (
          <MediaPlayer
            ref={player}
            title={details?.title || details?.name}
            src={formatProxyUrl(currentSource.url)}
            crossOrigin
            playsInline
            className="player"
            autoPlay
            onError={(err) => {
              console.log("Player error:", err);
              tryNextServer(currentServerIdx, season, episode);
            }}
          >
            <MediaProvider>
              <Poster
                className="vds-poster"
                src={`https://image.tmdb.org/t/p/original${details?.backdrop_path}`}
                alt={details?.title || details?.name}
              />
            </MediaProvider>
            <DefaultVideoLayout icons={defaultLayoutIcons} />
          </MediaPlayer>
        ) : !streamingLoading && !currentSource && (
          <div className="no-source">
            <p>No streams available. Please try another server or check back later.</p>
          </div>
        )}
        {streamingLoading && (
          <div className="streaming-loader">
            <Loader2 className="spin" size={48} color="var(--accent)" />
            <p>Locating best stream... Please wait.</p>
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
