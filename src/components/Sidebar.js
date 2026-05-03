'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Film, 
  Tv, 
  Search, 
  Download, 
  Library, 
  Settings,
  ShieldCheck,
  Info,
  Play
} from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'TV Shows', path: '/tv', icon: Tv },
  { name: 'Movies', path: '/tv?type=movie', icon: Film },
  { name: 'Live TV', path: '/livetv', icon: Play },
]

const footerItems = [
  { name: 'Config', path: '/config', icon: Settings },
  { name: 'Download', path: '/download', icon: Download },
  { name: 'DMCA', path: '/dmca', icon: ShieldCheck },
  { name: 'Privacy', path: '/privacy', icon: Info },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar glass">
      <Link href="/" className="logo">
        <motion.img
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          src="/logo.png"
          alt="Drishya Logo"
          className="main-logo"
        />
      </Link>

      <div className="nav-section">
        <p className="section-label">Browse</p>
        <nav>
          {navItems.map((item) => {
            const isActive = pathname === item.path
            const Icon = item.icon
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="nav-section footer-links">
        <p className="section-label">System</p>
        {footerItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`nav-item small ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>

    </aside>
  )
}
