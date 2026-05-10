'use client'

import { motion } from 'framer-motion'
import { Download, Smartphone, Monitor, Cpu, ChevronRight } from 'lucide-react'

const downloads = [
  { 
    platform: 'Android', 
    icon: Smartphone, 
    arch: 'arm64-v8a', 
    note: 'Modern Phones (Samsung, Pixel, etc.)',
    size: '42 MB',
    rec: true 
  },
  { 
    platform: 'Android', 
    icon: Smartphone, 
    arch: 'armeabi-v7a', 
    note: 'Legacy Devices',
    size: '38 MB',
    rec: false 
  },
  { 
    platform: 'Windows', 
    icon: Monitor, 
    arch: 'x64 Installer', 
    note: 'Windows 10 / 11',
    size: '22 MB',
    rec: true 
  },
  { 
    platform: 'Linux', 
    icon: Cpu, 
    arch: 'AppImage', 
    note: 'Most Distros',
    size: '28 MB',
    rec: true 
  },
]

export default function DownloadPage() {
  return (
    <div className="download-page fade-up">
      <div className="page-header">
        <span className="section-eyebrow">Get the app</span>
        <h1 className="page-title">DOWNLOAD<em>.</em></h1>
        <p className="page-sub">Free & open-source. Available for Android, Windows, and Linux.</p>
      </div>

      <div className="release-bar glass">
        <div className="online-dot"></div>
        <span>Latest Release: <strong>v1.2.0-stable</strong></span>
        <div className="spacer"></div>
        <span className="release-date">Released on April 28, 2026</span>
      </div>

      <div className="download-grid">
        {downloads.map((dl, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className={`download-card glass ${dl.rec ? 'recommended' : ''}`}
          >
            {dl.rec && <span className="rec-badge">Recommended</span>}
            <div className="card-header">
              <dl.icon size={24} className="platform-icon" />
              <div className="platform-info">
                <h3>{dl.platform}</h3>
                <p>{dl.arch}</p>
              </div>
            </div>
            <p className="dl-note">{dl.note}</p>
            <button className="apple-btn apple-btn-primary full-width">
              <Download size={18} /> Download
            </button>
            <p className="dl-size">{dl.size}</p>
          </motion.div>
        ))}
      </div>

      <div className="cta-banner glass">
        <div>
          <h3>CONFIGURE YOUR PROVIDERS</h3>
          <p>Connect Drishya to your preferred streaming backend with one tap.</p>
        </div>
        <a href="/config" className="apple-btn apple-btn-secondary">
          Open Config <ChevronRight size={18} />
        </a>
      </div>

    </div>
  )
}
