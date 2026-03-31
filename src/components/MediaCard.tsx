import { Link } from 'react-router-dom';
import { Media, getImageUrl } from '@/lib/tmdb';
import { Star } from 'lucide-react';
import styles from './MediaCard.module.css';

interface Props {
  media: Media;
  type: 'movie' | 'tv';
}

export default function MediaCard({ media, type }: Props) {
  const title = media.title || media.name || 'Untitled';
  const year = (media.release_date || media.first_air_date || '').split('-')[0];
  const rating = (media.vote_average || 0).toFixed(1);
  const to = `/details/${type}/${media.id}`;

  return (
    <Link to={to} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img 
          src={getImageUrl(media.poster_path, 'w500') || '/placeholder.png'} 
          alt={title} 
          width={500} 
          height={750} 
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.overlay}>
          <div className={styles.topInfo}>
            <span className={styles.rating}>
              <Star size={12} fill="currentColor" stroke="none" /> 
              {rating}
            </span>
          </div>
          <div className={styles.bottomInfo}>
            <h3 className={styles.title}>{title}</h3>
            <span className={styles.year}>{year}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
