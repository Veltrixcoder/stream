import MediaCard from './MediaCard';
import { Media } from '@/lib/tmdb';
import styles from './MediaGrid.module.css';
import { LucideIcon } from 'lucide-react';

interface Props {
  items: Media[];
  title?: string;
  type: 'movie' | 'tv';
  icon?: LucideIcon;
  iconColor?: string;
}

export default function MediaGrid({ items, title, type, icon: Icon, iconColor }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        {Icon ? (
           <div className={styles.iconWrapper} style={{ backgroundColor: iconColor }}>
             <Icon size={18} color="white" strokeWidth={3} />
           </div>
        ) : (
          <div className={styles.indicator} />
        )}
        {title && <h2 className={styles.title}>{title}</h2>}
        <div className={styles.line} />
      </div>
      
      <div className={styles.slider}>
        <div className={styles.track}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <MediaCard media={item} type={type} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
