'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Media, getImageUrl } from '@/lib/tmdb';
import { Play, Info, Star } from 'lucide-react';
import styles from './Hero.module.css';

interface Props {
  items: Media[];
}

export default function Hero({ items }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const current = items[index];
  const title = current.title || current.name;
  const backdrop = getImageUrl(current.backdrop_path, 'original');
  const type = current.media_type || (current.title ? 'movie' : 'tv');
  const rating = (current.vote_average || 0).toFixed(1);
  const year = (current.release_date || current.first_air_date || '').split('-')[0];

  return (
    <div className={styles.carousel}>
      <div className={styles.hero}>
        <div key={current.id} className={styles.slide}>
          <div className={styles.backdrop}>
            <Image 
              src={backdrop} 
              alt={title || 'featured'} 
              fill 
              className={styles.image}
              priority
            />
            <div className={styles.gradient} />
          </div>
          
          <div className={styles.content}>
            <div className={styles.topRow}>
              <span className={styles.typeBadge}>
                {type === 'tv' ? 'SERIES' : 'MOVIE'}
              </span>
              <div className={styles.dot} />
              <div className={styles.ratingInfo}>
                <Star size={14} fill="#FFCB45" stroke="none" />
                <span>{rating}</span>
              </div>
              <div className={styles.dot} />
              <span>{year}</span>
            </div>

            <h1 className={styles.title}>{title}</h1>
            <p className={styles.overview}>{current.overview}</p>
            
            <div className={styles.actions}>
              <Link href={`/details/${type}/${current.id}`} className={styles.btnPrimary}>
                <Play size={20} fill="currentColor" /> Play Now
              </Link>
              <Link href={`/details/${type}/${current.id}`} className={styles.btnSecondary}>
                <Info size={20} /> Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.indicators}>
        {items.map((_, i) => (
          <button 
            key={i} 
            className={`${styles.indicatorDot} ${i === index ? styles.activeDot : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
