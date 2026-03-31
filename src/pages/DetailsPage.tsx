import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDetails, getImageUrl, Media } from '@/lib/tmdb';
import { Play, Info, Star, Calendar, Film } from 'lucide-react';
import styles from './Details.module.css';

export default function DetailsPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!type || !id) return;
      try {
        const data = await getDetails(type as 'movie' | 'tv', id);
        setMedia(data);
      } catch (error) {
        console.error("Failed to fetch details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [type, id]);

  if (loading || !media) {
    return <div className="loading">Loading...</div>;
  }

  const title = media.title || media.name;
  const backdrop = getImageUrl(media.backdrop_path, 'original');
  const poster = getImageUrl(media.poster_path, 'w500');
  const year = (media.release_date || media.first_air_date || '').split('-')[0];
  const rating = (media.vote_average || 0).toFixed(1);

  return (
    <div className={styles.container}>
      <div className={styles.backdrop}>
        <img 
          src={backdrop} 
          alt={title || 'backdrop'} 
          className={styles.backdropImg}
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <div className={styles.posterWrapper}>
          <img 
            src={poster} 
            alt={title || 'poster'} 
            width={342} 
            height={513} 
            className={styles.poster}
          />
        </div>
        
        <div className={styles.info}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.meta}>
            <span className={styles.badge}><Film size={14} /> {type?.toUpperCase()}</span>
            <span className={styles.metaItem}><Calendar size={16} /> {year}</span>
            <span className={styles.metaItem}><Star size={16} fill="#ffcc00" color="#ffcc00" /> {rating}</span>
          </div>
          
          <div className={styles.overview}>
            <h2 className={styles.sectionTitle}><Info size={20} /> Overview</h2>
            <p>{media.overview}</p>
          </div>

          <div className={styles.actions}>
            <button className={styles.playBtn}>
              <Play size={22} fill="currentColor" /> Play Now
            </button>
            <button className={styles.trailerBtn}>
               Watch Trailer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
