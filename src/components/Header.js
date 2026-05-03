'use client';
import Link from 'next/link';
import { Search, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="global-header glass">
      <div className="header-left">
        <Link href="/" className="header-logo-link">
          <img src="/logo.png" alt="Drishya Logo" className="header-logo" />
          <span className="header-title">DRISHYA<em>.</em></span>
        </Link>
      </div>
      <div className="header-right">
        <Link href="/search" className="header-icon">
          <Search size={20} />
        </Link>
        <Link href="/config" className="header-icon">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}
