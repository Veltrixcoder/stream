import Image from 'next/image';
import Link from 'next/link';
import { getDetails, getImageUrl, getCredits, getRecommendations } from '@/lib/tmdb';
import { Play, Plus, Star, Calendar, Globe, Clock, ChevronRight } from 'lucide-react';
import MediaGrid from '@/components/MediaGrid';
import styles from './Details.module.css';

interface Props {
  params: Promise<{
    type: string;
    id: string;
  }>;
}

export default async function DetailsPage({ params }: Props) {
  const { type, id } = await params;
  
  const [media, credits, recommendations] = await Promise.all([
    getDetails(type as 'movie' | 'tv', id),
    getCredits(type as 'movie' | 'tv', id),
    getRecommendations(type as 'movie' | 'tv', id)
  ]);

  const title = media.title || media.name;
  const backdrop = getImageUrl(media.backdrop_path, 'original');
  const poster = getImageUrl(media.poster_path, 'w500');
  const year = (media.release_date || media.first_air_date || '').split('-')[0];
  const rating = (media.vote_average || 0).toFixed(1);
  const runtime = (media as any).runtime || ((media as any).episode_run_time && (media as any).episode_run_time[0]);
  const cast = credits.slice(0, 10);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.backdrop}>
          <Image 
            src={backdrop} 
            alt={title || 'backdrop'} 
            fill 
            className={styles.backdropImg}
            priority
          />
          <div className={styles.overlay} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.mainInfo}>
            <div className={styles.posterWrapper}>
              <Image 
                src={poster} 
                alt={title || 'poster'} 
                width={342} 
                height={513} 
                className={styles.poster}
              />
            </div>
            
            <div className={styles.details}>
              <div className={styles.topMeta}>
                 <span className={styles.typeBadge}>{type === 'tv' ? 'SERIES' : 'MOVIE'}</span>
                 {media.status && <span className={styles.statusBadge}>{media.status}</span>}
              </div>

              <h1 className={styles.title}>{title}</h1>

              <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                  <Star size={16} fill="#FFCB45" stroke="none" />
                  <span>{rating}</span>
                </div>
                <div className={styles.dot} />
                <div className={styles.metaItem}>
                  <Calendar size={16} />
                  <span>{year}</span>
                </div>
                {runtime && (
                  <>
                    <div className={styles.dot} />
                    <div className={styles.metaItem}>
                      <Clock size={16} />
                      <span>{runtime} min</span>
                    </div>
                  </>
                )}
                <div className={styles.dot} />
                <div className={styles.metaItem}>
                  <Globe size={16} />
                  <span style={{ textTransform: 'uppercase' }}>{(media as any).original_language}</span>
                </div>
              </div>

              <div className={styles.genres}>
                {media.genres?.map((g: any) => (
                  <span key={g.id} className={styles.genreTag}>{g.name}</span>
                ))}
              </div>

              <div className={styles.actions}>
                <button className={styles.playBtn}>
                  <Play size={22} fill="currentColor" /> WATCH NOW
                </button>
                <button className={styles.plusBtn}>
                  <Plus size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomContent}>
        {/* Overview */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Overview</h2>
          <p className={styles.overviewText}>{media.overview}</p>
        </section>

        {/* Cast */}
        {cast.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Top Cast</h2>
              <ChevronRight size={20} />
            </div>
            <div className={styles.castSlider}>
              {cast.map((person: any) => (
                <div key={person.id} className={styles.castCard}>
                  <div className={styles.castImageWrapper}>
                    <Image 
                      src={getImageUrl(person.profile_path, 'w500') || '/placeholder_avatar.png'} 
                      alt={person.name}
                      fill
                      className={styles.castImage}
                    />
                  </div>
                  <span className={styles.castName}>{person.name}</span>
                  <span className={styles.castCharacter}>{person.character}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className={styles.recommendations}>
             <MediaGrid 
                items={recommendations} 
                title="More Like This" 
                type={type as 'movie' | 'tv'} 
             />
          </div>
        )}
      </div>
    </div>
  );
}
