'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Trash2, History, Bookmark } from 'lucide-react';

export default function LibraryPage() {
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    const localHistory = JSON.parse(localStorage.getItem('drishya_history') || '[]');
    const localSaved = JSON.parse(localStorage.getItem('drishya_saved') || '[]');
    setHistory(localHistory);
    setSaved(localSaved);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('drishya_history');
    setHistory([]);
  };

  const removeItem = (id, type) => {
    const key = type === 'history' ? 'drishya_history' : 'drishya_saved';
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    type === 'history' ? setHistory(updated) : setSaved(updated);
  };

  return (
    <div className="library-page fade-in">
      <section className="section">
        <div className="section-header">
          <h1><History size={24} className="text-accent" /> Watch History</h1>
          {history.length > 0 && (
            <button onClick={clearHistory} className="clear-btn">
              <Trash2 size={18} /> Clear All
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="history-grid">
            {history.map((item) => (
              <div key={item.id} className="history-card glass-card">
                <div className="img-container">
                  <img src={`https://image.tmdb.org/t/p/w300${item.image}`} alt={item.title} />
                  <Link href={`/watch/${item.type}/${item.id}`} className="play-overlay">
                    <Play fill="white" size={24} />
                  </Link>
                </div>
                <div className="card-info">
                  <h3>{item.title}</h3>
                  <button onClick={() => removeItem(item.id, 'history')} className="remove-item">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state glass">
            <p>Your watch history is empty.</p>
            <Link href="/" className="btn-primary">Start Watching</Link>
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <h1><Bookmark size={24} className="text-accent" /> Saved Items</h1>
        </div>
        <div className="empty-state glass">
          <p>Coming Soon: Bookmark your favorite movies and shows.</p>
        </div>
      </section>

      <style jsx>{`
        .library-page {
          display: flex;
          flex-direction: column;
          gap: 60px;
        }

        .section {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-header h1 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 28px;
        }

        .clear-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-weight: 600;
          transition: color 0.2s;
        }

        .clear-btn:hover {
          color: var(--accent);
        }

        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }

        .history-card {
          overflow: hidden;
        }

        .img-container {
          position: relative;
          aspect-ratio: 16/9;
        }

        .img-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .history-card:hover .play-overlay {
          opacity: 1;
        }

        .card-info {
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-info h3 {
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .remove-item {
          color: var(--text-muted);
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .remove-item:hover {
          background: rgba(229, 9, 20, 0.1);
          color: var(--accent);
        }

        .empty-state {
          padding: 60px;
          text-align: center;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .history-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
