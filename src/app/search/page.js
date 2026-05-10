'use client';
import { useState, useEffect } from 'react';
import { TMDB_API } from '@/lib/api';
import MediaCard from '@/components/MediaCard';
import { Search as SearchIcon, X } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ movies: [], tv: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('movie');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const [movieResults, tvResults] = await Promise.all([
        TMDB_API.searchMovies(query),
        TMDB_API.searchTV(query),
      ]);
      setResults({
        movies: movieResults.results || [],
        tv: tvResults.results || [],
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page fade-in">
      <section className="search-header">
        <form onSubmit={handleSearch} className="search-bar glass">
          <SearchIcon size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search for movies or TV shows..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}>
              <X size={20} color="var(--text-muted)" />
            </button>
          )}
        </form>
      </section>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {(results.movies.length > 0 || results.tv.length > 0) && (
            <div className="tabs">
              <button 
                className={activeTab === 'movie' ? 'active' : ''} 
                onClick={() => setActiveTab('movie')}
              >
                Movies ({results.movies.length})
              </button>
              <button 
                className={activeTab === 'tv' ? 'active' : ''} 
                onClick={() => setActiveTab('tv')}
              >
                TV Shows ({results.tv.length})
              </button>
            </div>
          )}

          <div className="media-grid">
            {(activeTab === 'movie' ? results.movies : results.tv).map((item) => (
              <MediaCard key={item.id} item={item} type={activeTab} />
            ))}
          </div>

          {!loading && query && results.movies.length === 0 && results.tv.length === 0 && (
            <div className="no-results">
              <p>No results found for "{query}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
