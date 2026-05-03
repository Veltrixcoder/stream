'use client';

import { useState, useEffect, useRef } from 'react';
import { IPTV_API } from '@/lib/api';
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { Loader2, ArrowLeft, Tv, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function IPTVWatchPage() {
  const { id } = useParams();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const player = useRef(null);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        setLoading(true);
        const data = await IPTV_API.getChannelDetails(id);
        
        // Handle the dynamic 404 behavior mentioned in docs
        if (!data || !data.streams || data.streams.length === 0) {
          setError('Channel is currently offline or unavailable.');
          return;
        }

        setChannel(data);
      } catch (err) {
        console.error('Error fetching channel details:', err);
        setError('Channel not found or currently unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [id]);

  return (
    <div className="watch-page iptv-watch">
      <Link href="/livetv" className="back-btn glass">
        <ArrowLeft size={20} /> Back to Channels
      </Link>

      <div className="player-container glass">
        {loading ? (
          <div className="streaming-loader">
            <Loader2 className="spin" size={48} color="var(--accent)" />
            <p>Connecting to live stream...</p>
          </div>
        ) : error ? (
          <div className="no-source">
            <AlertCircle size={48} color="var(--accent)" />
            <p>{error}</p>
            <Link href="/livetv" className="apple-btn apple-btn-primary" style={{ marginTop: '20px' }}>
              Try Another Channel
            </Link>
          </div>
        ) : (
          <MediaPlayer
            ref={player}
            title={channel.name}
            src={channel.streams[0].url}
            crossOrigin
            playsInline
            className="player"
          >
            <MediaProvider>
              {channel.logo && <Poster src={channel.logo} className="vds-poster" />}
            </MediaProvider>
            <DefaultVideoLayout icons={defaultLayoutIcons} />
          </MediaPlayer>
        )}
      </div>

      {!loading && channel && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="content-details"
        >
          <div className="details-header">
            <div className="details-main">
              <div className="iptv-brand">
                <Tv size={20} color="var(--accent)" />
                <span>Live Broadcast</span>
              </div>
              <h1 className="details-title">{channel.name}</h1>
              <div className="details-meta">
                <span className="live-status-dot"></span>
                <span className="live-text">LIVE</span>
                <span className="dot"></span>
                <span>{channel.category || 'General'}</span>
                <span className="dot"></span>
                <span>{channel.language || 'English'}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h2 className="section-title">Channel Information</h2>
            <p className="details-overview">
              {channel.description || `Watching ${channel.name} live on Drishya. High-quality IPTV streaming with minimal latency.`}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
