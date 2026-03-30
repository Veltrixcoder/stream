import Link from 'next/link';
import Image from 'next/image';
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
  const href = `/details/${type}/${media.id}`;
  const isUnreleased = media.status === 'In Production' || media.status === 'Planned' || (media.release_date && new Date(media.release_date) > new Date());

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image 
          src={getImageUrl(media.poster_path, 'w500') || '/placeholder.png'} 
          alt={title} 
          width={500} 
          height={750} 
          className={styles.image}
          loading="lazy"
        />
        
        {/* Top Badges */}
        <div className={styles.topBadges}>
          {isUnreleased && <span className={styles.soonBadge}>SOON</span>}
          {parseFloat(rating) > 0 && (
            <span className={styles.ratingBadge}>
              <Star size={10} fill="#FFCB45" stroke="none" />
              {rating}
            </span>
          )}
        </div>

        <div className={styles.overlay}>
          <div className={styles.bottomInfo}>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.meta}>
              <span className={styles.typeTag}>{type === 'tv' ? 'SERIES' : 'MOVIE'}</span>
              <span className={styles.year}>{year}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
