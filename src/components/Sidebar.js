'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'TV Shows', path: '/tv' },
  { name: 'Live TV', path: '/livetv' },
  { name: 'Library', path: '/library' },
  { name: 'Download', path: '/download' },
  { name: 'DMCA', path: '/dmca' },
  { name: 'Privacy', path: '/privacy' },
]

export default function Sidebar() {
  const pathname = usePathname()
  
  // Hide sidebar on details and player pages
  if (pathname?.startsWith('/details') || pathname?.startsWith('/watch')) {
    return null;
  }

  return (
    <aside className="sidebar glass">
      <nav className="nav-container">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
