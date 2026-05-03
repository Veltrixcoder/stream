'use client';

import { useState, useEffect } from 'react';
import { IPTV_API } from '@/lib/api';
import { Search, Tv, Loader2, AlertCircle, Globe, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function LiveTVPage() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCountries();
    const savedCountry = localStorage.getItem('drishya_iptv_country');
    if (savedCountry) {
      setSelectedCountry(savedCountry);
      fetchChannels(savedCountry);
    }
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const data = await IPTV_API.getCountries();
      // Handle array structure as seen in logs
      const list = Array.isArray(data) ? data : (data.countries || []);
      
      if (list.length === 0) {
        setCountries([
          { name: 'India', code: 'IN', channelCount: 500 },
          { name: 'USA', code: 'US', channelCount: 300 },
          { name: 'UK', code: 'UK', channelCount: 200 },
        ]);
      } else {
        // Format array items if they are just strings or need mapping
        setCountries(list.map(c => typeof c === 'string' ? { name: c, code: c } : c));
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError('Failed to load countries.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async (countryCode) => {
    try {
      setLoading(true);
      setSelectedCountry(countryCode);
      localStorage.setItem('drishya_iptv_country', countryCode);
      const data = await IPTV_API.getChannels(countryCode);
      // Use data.results as seen in logs
      const list = data.results || (Array.isArray(data) ? data : []);
      setChannels(list);
      setError(null);
    } catch (err) {
      setError('Failed to load channels for this country.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      if (selectedCountry) fetchChannels(selectedCountry);
      return;
    }
    try {
      setLoading(true);
      const data = await IPTV_API.searchChannels(searchQuery);
      setChannels(data.channels || []);
      setError(null);
    } catch (err) {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedCountry(null);
    setChannels([]);
    setSearchQuery('');
    localStorage.removeItem('drishya_iptv_country');
  };

  if (loading && countries.length === 0) {
    return (
      <div className="loading-container">
        <Loader2 className="spin" size={48} color="var(--accent)" />
        <p>Initializing Live TV...</p>
      </div>
    );
  }

  return (
    <div className="livetv-page fade-up">
      <header className="page-header">
        <div className="header-content">
          <span className="section-eyebrow">IPTV Premium</span>
          <h1 className="page-title">
            {selectedCountry ? `Channels: ${selectedCountry}` : 'Select Country'}
          </h1>
          <p className="page-subtitle">
            {selectedCountry ? 'STREAMING LIVE BROADCASTS' : 'BROWSE GLOBAL BROADCAST NETWORKS'}
          </p>
        </div>

        {selectedCountry && (
          <form onSubmit={handleSearch} className="search-bar-container">
            <div className="search-bar glass">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search channels..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="button" onClick={resetSelection} className="back-to-countries">
              Change Country
            </button>
          </form>
        )}
      </header>

      {error && (
        <div className="error-box glass">
          <AlertCircle size={24} color="var(--accent)" />
          <p>{error}</p>
          <button onClick={selectedCountry ? () => fetchChannels(selectedCountry) : fetchCountries} className="apple-btn apple-btn-primary">Retry</button>
        </div>
      )}

      <AnimatePresence mode='wait'>
        {!selectedCountry ? (
          <motion.div 
            key="countries"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="country-selection"
          >
            <div className="country-grid">
              {countries.map((c) => (
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  key={c.code}
                  onClick={() => fetchChannels(c.code)}
                  className="country-card glass-card"
                >
                  <div className="country-flag-icon">
                    <Globe size={32} color="var(--accent)" />
                  </div>
                  <div className="country-info">
                    <h3>{c.name}</h3>
                    <p>{c.channelCount || 0} Channels</p>
                  </div>
                  <ChevronRight size={20} className="chevron" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="channels"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="channel-results"
          >
            {loading ? (
              <div className="loading-container" style={{ minHeight: '400px' }}>
                <Loader2 className="spin" size={48} color="var(--accent)" />
                <p>Fetching channels for {selectedCountry}...</p>
              </div>
            ) : (
              <div className="channel-grid">
                {channels.map((channel) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={channel.id}
                  >
                    <Link href={`/watch/iptv/${channel.id}`} className="channel-card glass-card">
                      <div className="channel-logo-container">
                        {channel.logo ? (
                          <img src={channel.logo} alt={channel.name} loading="lazy" />
                        ) : (
                          <div className="channel-placeholder">
                            <Tv size={40} color="rgba(255,255,255,0.2)" />
                          </div>
                        )}
                        <div className="live-badge">LIVE</div>
                      </div>
                      <div className="channel-info">
                        <h3>{channel.name}</h3>
                        <p>{channel.category || 'General'}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && channels.length === 0 && (
              <div className="empty-state">
                <Tv size={64} color="var(--text-dim)" />
                <p>No channels available in this region.</p>
                <button onClick={resetSelection} className="apple-btn apple-btn-primary">Select Another Country</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
