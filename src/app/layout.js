import './globals.css'
import Sidebar from '@/components/Sidebar'
import MobileNavbar from '@/components/MobileNavbar'
import Header from '@/components/Header'
import { Send } from 'lucide-react'

export const metadata = {
  title: 'Drishya - Premium Movie Streaming',
  description: 'Watch your favorite movies and series in high quality.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="layout-container">
          <Sidebar />
          <main className="content">
            <Header />
            {children}
          </main>
          <MobileNavbar />
          <a 
            href="https://t.me/drishyapp" 
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
