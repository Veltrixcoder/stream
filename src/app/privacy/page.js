'use client'

import { ShieldCheck, EyeOff, Lock, Database } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="legal-page fade-up">
      <div className="page-header">
        <span className="section-eyebrow">Privacy</span>
        <h1 className="page-title">PRIVACY POLICY<em>.</em></h1>
        <div className="page-meta">
          <span className="meta-pill glass">Last updated: April 22, 2026</span>
          <span className="meta-pill glass success"><ShieldCheck size={14} /> Your privacy is protected</span>
        </div>
      </div>

      <section className="legal-section">
        <div className="section-head">
          <Database size={20} />
          <h2>Data Collection</h2>
        </div>
        <div className="section-content glass">
          <p>Drishya is designed to be as private as possible. We do not require account registration, and we do not collect personal information such as your name, email address, or phone number.</p>
          <p>The app stores your watch history and library locally on your device. This data is never uploaded to our servers.</p>
        </div>
      </section>

      <section className="legal-section">
        <div className="section-head">
          <Lock size={20} />
          <h2>Local Storage</h2>
        </div>
        <div className="section-content glass">
          <p>All your preferences, bookmarks, and watch progress are stored using local storage on your Android device. You can clear this data at any time by clearing the app cache or uninstalling the application.</p>
        </div>
      </section>

      <section className="legal-section">
        <div className="section-head">
          <EyeOff size={20} />
          <h2>Third-Party Services</h2>
        </div>
        <div className="section-content glass">
          <p>Drishya connects to third-party streaming providers and TMDB for metadata. These services may collect their own data (such as IP addresses) when you request content through the app. We recommend reviewing the privacy policies of any third-party providers you configure.</p>
        </div>
      </section>

    </div>
  )
}
