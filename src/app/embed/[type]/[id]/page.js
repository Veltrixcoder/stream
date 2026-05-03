'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { STREAM_API } from '@/lib/api';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

export default function EmbedPage() {
  const { type, id } = useParams();
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSource = async () => {
      try {
        const sourcesData = await STREAM_API.getSources(type, id);
        if (sourcesData && sourcesData.length > 0) {
          setSource(sourcesData[0]);
        }
      } catch (error) {
        console.error('Error loading embed source:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSource();
  }, [type, id]);

  if (loading) {
    return <div className="loading">Loading Player...</div>;
  }

  return (
    <div className="embed-container">
      {source ? (
        <MediaPlayer
          src={source.url}
          crossOrigin
          playsInline
          className="player"
        >
          <MediaProvider />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      ) : (
        <div className="error">No video source found.</div>
      )}

      <style jsx global>{`
        body { margin: 0; background: black; overflow: hidden; }
        .embed-container { width: 100vw; height: 100vh; }
        .player { width: 100%; height: 100%; }
        .loading, .error { 
          color: white; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          font-family: sans-serif;
        }
      `}</style>
    </div>
  );
}
