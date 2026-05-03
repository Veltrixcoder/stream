'use client'

import { motion } from 'framer-motion'
import { Play, Info, Settings, ShieldCheck, Download, Plus } from 'lucide-react'

const providers = [
  { id: 'p1', name: 'Provider 1', desc: 'Primary streaming instance.', num: '01' },
  { id: 'p2', name: 'Provider 2', desc: 'Secondary streaming instance.', num: '02' },
  { id: 'p3', name: 'Provider 3', desc: 'Tertiary streaming instance.', num: '03' },
]

export default function ConfigPage() {
  const BASE_URL = "https://veltrixcode-drishya-lbb.hf.space/"
  const deeplink = `drishya://config?base=${encodeURIComponent(BASE_URL)}`

  return (
    <div className="config-page fade-up">
      <div className="page-header">
        <span className="section-eyebrow">Setup</span>
        <div className="app-id">
          <div className="app-id-logo">
            <img src="/logo.png" alt="Drishya Logo" />
          </div>
          <div>
            <h1 className="app-id-name">DRISHYA<em>.</em></h1>
            <p className="app-id-sub">Streaming Provider Configuration</p>
          </div>
        </div>
        <p className="page-subtitle">MANAGE YOUR STREAMING PROVIDERS</p>
      </div>

      <div className="note-box glass">
        <Info className="note-icon" size={18} />
        <span>All sources connect to the same backend instance. Tap <strong>Connect</strong> and Drishya will open automatically to apply the configuration.</span>
      </div>

      <div className="providers">
        {providers.map((p) => (
          <motion.div 
            key={p.id}
            whileHover={{ scale: 1.02 }}
            className="provider-card glass"
          >
            <div className="provider-left">
              <div className="provider-num">Provider · {p.num}</div>
              <div className="provider-name">{p.name}</div>
              <div className="provider-desc">{p.desc}</div>
            </div>
            <a href={deeplink} className="connect-btn apple-btn apple-btn-primary">
              Connect <Plus size={16} />
            </a>
          </motion.div>
        ))}
      </div>

      <div className="status-row glass">
        <div className="status-dot"></div>
        All providers are operational and pointing to the same backend instance.
      </div>

      <div className="footer-cta">
        <p>Don't have Drishya installed yet?</p>
        <a href="/download" className="apple-btn apple-btn-primary" style={{ display: 'inline-flex', marginTop: '12px' }}>
          <Download size={18} /> Download the app
        </a>
      </div>

    </div>
  )
}
