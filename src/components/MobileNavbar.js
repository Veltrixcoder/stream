'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Film, 
  Tv, 
  Search, 
  Download,
  Settings,
  ShieldAlert,
  Play
} from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'TV', path: '/tv', icon: Tv },
  { name: 'Live', path: '/livetv', icon: Play },
  { name: 'Config', path: '/config', icon: Settings },
  { name: 'Download', path: '/download', icon: Download },
]

export default function MobileNavbar() {
  const pathname = usePathname()

  return (
    <div className="mobile-nav-container">
      <nav className="mobile-nav glass">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                className="icon-wrapper"
              >
                <Icon size={20} />
              </motion.div>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

    </div>
  )
}
