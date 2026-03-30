'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Film, Tv, Settings } from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { href: '/', label: 'Home', icon: <Home size={22} /> },
  { href: '/movies', label: 'Movies', icon: <Film size={22} /> },
  { href: '/live-tv', label: 'Live TV', icon: <Tv size={22} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.top}>
          <Link href="/" className={styles.logo}>
            <Image 
               src="/logo.png" 
               alt="Streamflix" 
               width={180} 
               height={40} 
               className={styles.logoImg} 
               priority 
               onError={(e) => {
                 // Fallback if logo is missing
                 const target = e.target as HTMLImageElement;
                 target.style.display = 'none';
               }}
            />
          </Link>
        </div>
        
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className={styles.bottom}>
          <Link 
            href="/config" 
            className={`${styles.navLink} ${pathname === '/config' ? styles.active : ''}`}
          >
            <span className={styles.icon}><Settings size={22} /></span>
            <span className={styles.label}>Config</span>
          </Link>
        </div>
      </aside>

      <div className={styles.mobileNav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`${styles.mobileNavLink} ${isActive ? styles.active : ''}`}
            >
              {item.icon}
            </Link>
          );
        })}
        <Link 
          href="/config" 
          className={`${styles.mobileNavLink} ${pathname === '/config' ? styles.active : ''}`}
        >
          <Settings size={22} />
        </Link>
      </div>
    </>
  );
}
