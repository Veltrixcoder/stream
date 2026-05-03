'use client';
import Link from 'next/link';
import { Play } from 'lucide-react';

const MediaCard = ({ item, type }) => {
  const title = item.title || item.name;
  const image = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : '/placeholder.jpg';
  const rating = item.vote_average?.toFixed(1);
  const year = (item.release_date || item.first_air_date)?.split('-')[0];

  return (
    <Link href={`/watch/${type}/${item.id}`} className="media-card">
      <div className="poster-container">
        <img src={image} alt={title} loading="lazy" />
        <div className="overlay">
          <div className="play-button">
            <Play fill="white" size={24} />
          </div>
        </div>
      </div>
      <div className="info">
        <h3>{title}</h3>
      </div>
    </Link>
  );
};

export default MediaCard;
