import { Link } from 'react-router-dom';
import { Media, getImageUrl } from '@/lib/tmdb';
import { Play, Plus } from 'lucide-react';
import styles from './Hero.module.css';

interface Props {
  media: Media;
}

export default function Hero({ media }: Props) {
  if (!media) return null;

  const title = media.title || media.name;
  const backdrop = getImageUrl(media.backdrop_path, 'original');
  const type = media.media_type || (media.title ? 'movie' : 'tv');

  return (
    <div className={styles.hero}>
      <div className={styles.backdrop}>
        <img 
          src={backdrop} 
          alt={title || 'featured'} 
          className={styles.image}
        />
        <div className={styles.gradient} />
      </div>
      
      <div className={styles.content}>
        <span className={styles.badge}>Trending Now</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.overview}>{media.overview}</p>
        
        <div className={styles.actions}>
          <Link to={`/details/${type}/${media.id}`} className={styles.btnPrimary}>
            <Play size={20} fill="currentColor" /> Watch Now
          </Link>
          <button className={styles.btnSecondary}>
            <Plus size={20} /> Add to List
          </button>
        </div>
      </div>
    </div>
  );
}
