'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Cpu, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  Calendar 
} from 'lucide-react'

// Helper to format bytes to human readable size
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return 'Unknown Size';
  const k = 1024;
  const dm = 1;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper to determine platform details from filename
const getPlatformDetails = (assetName) => {
  const name = assetName.toLowerCase();
  let platform = 'Unknown';
  let icon = Download;
  let arch = 'Binary';
  let note = 'General build binary';
  let rec = false;

  if (name.endsWith('.apk')) {
    platform = 'Android';
    icon = Smartphone;
    if (name.includes('arm64-v8a')) {
      arch = 'Android arm64-v8a';
      note = 'Recommended for modern phones (Samsung, Pixel, OnePlus, etc.)';
      rec = true;
    } else if (name.includes('armeabi-v7a')) {
      arch = 'Android armeabi-v7a';
      note = 'Compatible with legacy and budget 32-bit devices';
    } else if (name.includes('x86_64')) {
      arch = 'Android x86_64';
      note = 'Compatible with Android emulators and Chromebooks';
    } else {
      arch = 'Android Universal';
      note = 'All-in-one bundle, compatible with most Android devices';
    }
  } else if (name.endsWith('.exe') || name.endsWith('.msi')) {
    platform = 'Windows';
    icon = Monitor;
    arch = name.endsWith('.exe') ? 'Windows Installer (.exe)' : 'Windows Installer (.msi)';
    note = 'Desktop app for Windows 10 / 11';
    rec = true;
  } else if (name.endsWith('.dmg') || name.endsWith('.pkg')) {
    platform = 'macOS';
    icon = Monitor;
    arch = name.endsWith('.dmg') ? 'macOS Disk Image (.dmg)' : 'macOS Installer (.pkg)';
    note = 'Desktop app for macOS 11+ (Intel & Apple Silicon)';
    rec = true;
  } else if (name.endsWith('.appimage') || name.endsWith('.deb') || name.endsWith('.rpm')) {
    platform = 'Linux';
    icon = Cpu;
    if (name.endsWith('.appimage')) {
      arch = 'Linux AppImage';
      note = 'Portable binary for most Linux distributions';
    } else if (name.endsWith('.deb')) {
      arch = 'Debian / Ubuntu Package';
      note = 'Compatible with Debian, Ubuntu, Linux Mint, etc.';
    } else if (name.endsWith('.rpm')) {
      arch = 'RPM Package';
      note = 'Compatible with Fedora, RHEL, openSUSE, etc.';
    }
    rec = true;
  }

  return { platform, icon, arch, note, rec };
}

// Helper to format the markdown changelog into JSX
const formatChangelog = (markdown) => {
  if (!markdown) return <p>No release notes provided.</p>;
  
  return markdown.split('\n').map((line, idx) => {
    const cleanLine = line.trim();
    
    // Header mappings
    if (cleanLine.startsWith('###')) {
      return <h4 key={idx} className="changelog-h4">{cleanLine.replace(/^###\s*/, '')}</h4>;
    }
    if (cleanLine.startsWith('##')) {
      return <h3 key={idx} className="changelog-h3">{cleanLine.replace(/^##\s*/, '')}</h3>;
    }
    if (cleanLine.startsWith('#')) {
      return <h2 key={idx} className="changelog-h2">{cleanLine.replace(/^#\s*/, '')}</h2>;
    }
    
    // Horizontal rule
    if (cleanLine === '---') {
      return <hr key={idx} className="changelog-hr" />;
    }
    
    // Unordered lists
    if (cleanLine.startsWith('*') || cleanLine.startsWith('-')) {
      // Bold items inside lists
      let content = cleanLine.substring(1).trim();
      return (
        <li key={idx} className="changelog-li">
          {renderLineWithBold(content)}
        </li>
      );
    }
    
    // Standard paragraph with bold formatting support
    if (cleanLine) {
      return (
        <p key={idx} className="changelog-p">
          {renderLineWithBold(cleanLine)}
        </p>
      );
    }
    
    return <div key={idx} className="changelog-space" />;
  });
}

// Simple bold parsing helper (handles **bold text**)
const renderLineWithBold = (text) => {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  if (parts.length === 1) return text;
  
  return parts.map((part, index) => {
    // Odd indexes represent the text captured between double asterisks
    if (index % 2 === 1) {
      return <strong key={index}>{part}</strong>;
    }
    return part;
  });
}

export default function DownloadPage() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/Shashwat-CODING/Luxa/releases');
        if (!res.ok) {
          throw new Error(`GitHub API returned status ${res.status}`);
        }
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No releases found in the repository.');
        }
        setReleases(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch releases:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReleases();
  }, []);

  if (loading) {
    return (
      <div className="download-page">
        <div className="page-header">
          <span className="section-eyebrow">Get the app</span>
          <h1 className="page-title">DOWNLOAD<em>.</em></h1>
        </div>
        <div className="loading-spinner">
          <Loader2 size={40} className="spinner-icon" />
        </div>
      </div>
    )
  }

  if (error || releases.length === 0) {
    return (
      <div className="download-page">
        <div className="page-header">
          <span className="section-eyebrow">Get the app</span>
          <h1 className="page-title">DOWNLOAD<em>.</em></h1>
        </div>
        <div className="error-message glass">
          <AlertCircle size={40} className="error-icon" style={{ color: '#ff453a' }} />
          <h3>Unable to fetch releases</h3>
          <p>We couldn't retrieve the latest app releases from the GitHub API: {error}. You can still download the files directly from GitHub.</p>
          <a 
            href="https://github.com/Shashwat-CODING/Luxa/releases" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="apple-btn apple-btn-primary"
          >
            Go to GitHub Releases <ChevronRight size={18} />
          </a>
        </div>
      </div>
    )
  }

  const latestRelease = releases[0];
  
  // Format release date
  const releaseDateStr = new Date(latestRelease.published_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Filter out source code zip files and map release assets to our download cards
  const downloadAssets = latestRelease.assets
    .map(asset => {
      const details = getPlatformDetails(asset.name);
      return {
        id: asset.id,
        name: asset.name,
        downloadUrl: asset.browser_download_url,
        size: formatBytes(asset.size),
        downloadsCount: asset.download_count,
        ...details
      };
    });

  return (
    <div className="download-page fade-up">
      <div className="page-header">
        <span className="section-eyebrow">Get the app</span>
        <h1 className="page-title">DOWNLOAD<em>.</em></h1>
        <p className="page-sub">Free & open-source movie streaming app. Available for Android and other platforms.</p>
      </div>

      <div className="release-bar glass">
        <div className="online-dot"></div>
        <span>Latest Release: <strong>{latestRelease.name || latestRelease.tag_name}</strong></span>
        <div className="spacer"></div>
        <Calendar size={14} style={{ opacity: 0.6 }} />
        <span className="release-date">Released on {releaseDateStr}</span>
      </div>

      {downloadAssets.length > 0 ? (
        <div className="download-grid">
          {downloadAssets.map((dl) => (
            <motion.div 
              key={dl.id}
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
              <a 
                href={dl.downloadUrl}
                className="apple-btn apple-btn-primary full-width"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <Download size={18} /> Download
              </a>
              <p className="dl-size">{dl.size} • {dl.downloadsCount} downloads</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="error-message glass" style={{ border: '1px solid var(--glass-border)', background: 'transparent' }}>
          <AlertCircle size={32} style={{ color: 'var(--text-dim)' }} />
          <h3>No prebuilt binaries found</h3>
          <p>The latest release {latestRelease.tag_name} does not have prebuilt binaries attached. You can download the source code or check the GitHub release page.</p>
          <a 
            href={latestRelease.html_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="apple-btn apple-btn-primary"
          >
            View Release on GitHub <ChevronRight size={18} />
          </a>
        </div>
      )}

      {/* Changelog Section */}
      {latestRelease.body && (
        <div className="changelog-section">
          <h2>Changelog ({latestRelease.tag_name})</h2>
          <div className="changelog-card glass">
            <div className="changelog-content">
              {formatChangelog(latestRelease.body)}
            </div>
          </div>
        </div>
      )}

      {/* Older Releases Grid */}
      {releases.length > 1 && (
        <div className="older-releases-section">
          <h2>Older Releases</h2>
          <div className="older-releases-grid">
            {releases.slice(1, 5).map((rel) => {
              const relDate = new Date(rel.published_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              
              const relAssets = rel.assets.filter(a => !a.name.endsWith('.zip') && !a.name.endsWith('.tar.gz'));

              return (
                <div key={rel.id} className="older-release-card glass">
                  <div className="older-release-header">
                    <h4>{rel.name || rel.tag_name}</h4>
                    <span className="release-date">{relDate}</span>
                  </div>
                  <div className="older-assets-list">
                    {relAssets.length > 0 ? (
                      relAssets.map((asset) => (
                        <a 
                          key={asset.id} 
                          href={asset.browser_download_url} 
                          className="older-asset-item"
                          title={`Download ${asset.name}`}
                        >
                          <span className="older-asset-name">{asset.name.replace('-release.apk', '')}</span>
                          <span className="older-asset-meta">
                            <span>{formatBytes(asset.size)}</span>
                            <div className="older-asset-dl">
                              <Download size={14} />
                            </div>
                          </span>
                        </a>
                      ))
                    ) : (
                      <span className="dl-note" style={{ margin: 0 }}>No binaries attached.</span>
                    )}
                    <a 
                      href={rel.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="older-asset-item"
                      style={{ borderStyle: 'dashed', justifyContent: 'center' }}
                    >
                      View on GitHub <ChevronRight size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}
