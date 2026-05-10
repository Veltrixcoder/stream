'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { IPTV_API } from '@/lib/api';
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), { ssr: false });
import { Loader2, ArrowLeft, Tv, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function IPTVWatchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const player = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchChannel = async () => {
      try {
        setLoading(true);
        const data = await IPTV_API.getChannelDetails(id);
        
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

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spin" size={48} color="var(--accent)" />
        <p>Fetching media...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-box glass" style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center', padding: '40px' }}>
        <AlertCircle size={48} color="var(--accent)" style={{ marginBottom: '20px' }} />
        <p>{error}</p>
        <Link href="/livetv" className="apple-btn apple-btn-primary" style={{ marginTop: '20px' }}>
          Try Another Channel
        </Link>
      </div>
    );
  }

  return (
    <div className="watch-page iptv-watch fade-in">
      <button onClick={() => router.back()} className="back-btn-float glass">
        <ArrowLeft size={24} />
      </button>

      <div className="player-container glass">
        {mounted && channel ? (
          <VideoPlayer 
            src={channel.streams[0].url}
            title={channel.name}
            poster={channel.logo}
          />
        ) : (
          <div className="streaming-loader">
            <Loader2 className="spin" size={48} color="var(--accent)" />
            <p>Fetching media...</p>
          </div>
        )}
      </div>

      {channel && (
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
              {channel.description || `Watching ${channel.name} live on Luxa. High-quality IPTV streaming with minimal latency.`}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function IPTVWatchPage() {
  return (
    <Suspense fallback={<div className="loading-container"><Loader2 className="spin" size={48} color="var(--accent)" /></div>}>
      <IPTVWatchContent />
    </Suspense>
  );
}
