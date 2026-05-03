'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { TMDB_API, STREAM_API, SOURCES } from '@/lib/api';
import { MediaPlayer, MediaProvider, Poster, Track } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { Calendar, Star, Clock, List, Loader2 } from 'lucide-react';

export default function WatchPage() {
  const { type, id } = useParams();
  const [details, setDetails] = useState(null);
  const [sources, setSources] = useState([]);
  const [currentSource, setCurrentSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streamingLoading, setStreamingLoading] = useState(false);
  const [currentSourceIdx, setCurrentSourceIdx] = useState(0);
  const [linkIdx, setLinkIdx] = useState(0);
  const player = useRef(null);

  const tryNextSource = async (sIdx = currentSourceIdx, lIdx = linkIdx + 1) => {
    // If there are more links in current source, try them
    if (sources && lIdx < sources.length) {
      console.log(`Trying next link (${lIdx + 1}) in current source...`);
      setLinkIdx(lIdx);
      setCurrentSource(sources[lIdx]);
      return;
    }

    // Otherwise, move to next source in SOURCES list
    const nextSIdx = sIdx + 1;
    if (nextSIdx >= SOURCES.length) {
      console.error("All sources and links exhausted.");
      setStreamingLoading(false);
      setCurrentSource(null);
      return;
    }

    console.log(`Switching to source ${SOURCES[nextSIdx]}...`);
    setStreamingLoading(true);
    setCurrentSourceIdx(nextSIdx);
    setLinkIdx(0);
    
    try {
      const data = await STREAM_API.getSources(SOURCES[nextSIdx], type, id);
      if (data && data.length > 0) {
        setSources(data);
        setCurrentSource(data[0]);
        setStreamingLoading(false);
      } else {
        // This source has no links, try next one immediately
        tryNextSource(nextSIdx, 0);
      }
    } catch (e) {
      console.error(`Source ${SOURCES[nextSIdx]} API failed, trying next...`);
      tryNextSource(nextSIdx, 0);
    }
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
        setStreamingLoading(true);
        try {
          const data = await STREAM_API.getSources(SOURCES[0], type, id);
          if (data && data.length > 0) {
            setSources(data);
            setCurrentSource(data[0]);
            setStreamingLoading(false);
          } else {
            tryNextSource(0, 0);
          }
        } catch (e) {
          tryNextSource(0, 0);
        }

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
        {currentSource ? (
          <MediaPlayer
            ref={player}
            title={details?.title || details?.name}
            src={currentSource.url}
            crossOrigin
            playsInline
            className="player"
            onError={() => {
              console.log("Player error, triggering fallback...");
              tryNextSource();
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
          {sources.length > 1 && (
            <div className="sources-list glass-card">
              <h3><List size={20} /> Select Quality</h3>
              <div className="source-buttons">
                {sources.map((source, index) => (
                  <button 
                    key={index}
                    className={currentSource?.url === source.url ? 'active' : ''}
                    onClick={() => setCurrentSource(source)}
                  >
                    {source.quality}p - Link {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
