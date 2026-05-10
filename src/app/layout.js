import './globals.css'
import Sidebar from '@/components/Sidebar'
import { Send } from 'lucide-react'

export const metadata = {
  title: 'Luxa - Premium Movie Streaming',
  description: 'Watch your favorite movies and series in high quality.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Luxa',
  },
}

export const viewport = {
  themeColor: '#007aff',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="layout-container">
          <Sidebar />
          <main className="content">
            {children}
          </main>
          <a 
            href="https://t.me/luxa_app" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="telegram-float-btn"
            title="Join our Telegram"
          >
            <Send size={24} style={{ transform: 'rotate(-20deg)', marginLeft: '-2px' }} />
          </a>
        </div>
      </body>
    </html>
  )
}
