'use client'

import { ShieldAlert, Info, Scale, Mail } from 'lucide-react'

export default function DMCAPage() {
  return (
    <div className="legal-page fade-up">
      <div className="page-header">
        <span className="section-eyebrow">Legal</span>
        <h1 className="page-title">DMCA & LEGAL<em>.</em></h1>
        <div className="page-meta">
          <span className="meta-pill glass">Last updated: April 22, 2026</span>
          <span className="meta-pill glass warning"><ShieldAlert size={14} /> Please read carefully</span>
        </div>
      </div>

      <div className="critical-banner glass">
        <div className="critical-icon"><ShieldAlert size={20} /></div>
        <div className="critical-body">
          <h3>Important Notice About Content</h3>
          <p><strong>Drishya does not host, store, or distribute any movies, TV shows, or media files on its own servers.</strong> All content accessible through the app is provided by non-affiliated, independent third-party providers. Drishya is a free, open-source Android application that acts solely as a client interface.</p>
        </div>
      </div>

      <section className="legal-section">
        <div className="section-head">
          <Scale size={20} />
          <h2>DMCA Notice</h2>
        </div>
        <div className="section-content glass">
          <p>Drishya operates in accordance with the Digital Millennium Copyright Act (DMCA) and respects the intellectual property rights of all copyright holders. We expect users of our app and website to do the same.</p>
          <ul>
            <li>We do <strong>not</strong> host, store, or distribute any copyrighted material on our servers.</li>
            <li>All media content streamed through Drishya originates exclusively from non-affiliated third-party public providers.</li>
            <li>If you believe content accessible through Drishya infringes your copyright, please <strong>contact the original content provider or hosting service directly</strong>.</li>
          </ul>
        </div>
      </section>

      <section className="legal-section">
        <div className="section-head">
          <Info size={20} />
          <h2>Disclaimer</h2>
        </div>
        <div className="section-content glass">
          <p>Drishya is provided "as is" under the MIT License, without warranty of any kind. The developers make no guarantees regarding the availability, legality, or quality of third-party content accessible through the app.</p>
          <p>Users are solely responsible for ensuring their use of any content accessed through Drishya complies with applicable laws in their jurisdiction. We do not condone or encourage copyright infringement.</p>
        </div>
      </section>

      <section className="legal-section">
        <div className="section-head">
          <Mail size={20} />
          <h2>Contact</h2>
        </div>
        <div className="section-content glass">
          <p>For technical issues with website functionality, broken links, or non-copyright matters, reach us via our GitHub Issues or Telegram.</p>
          <div className="contact-links">
            <a href="https://github.com/Shashwat-CODING/Drishya/issues" className="apple-btn apple-btn-secondary">GitHub Issues</a>
            <a href="https://t.me/drishyapp" className="apple-btn apple-btn-secondary">Telegram Community</a>
          </div>
        </div>
      </section>

    </div>
  )
}
