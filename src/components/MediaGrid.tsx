import MediaCard from './MediaCard';
import { Media } from '@/lib/tmdb';
import styles from './MediaGrid.module.css';

interface Props {
  items: Media[];
  title?: string;
  type: 'movie' | 'tv';
}

export default function MediaGrid({ items, title, type }: Props) {
  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.grid}>
        {items.map((item) => (
          <MediaCard key={item.id} media={item} type={type} />
        ))}
      </div>
    </section>
  );
}
