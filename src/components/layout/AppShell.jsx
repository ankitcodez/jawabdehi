import { Outlet, ScrollRestoration } from 'react-router-dom'
import EmergencyBanner from './EmergencyBanner'
import Header from './Header'
import Footer from './Footer'

export default function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <EmergencyBanner />
      <Header />
      <main id="main-content" className="flex-1" tabIndex="-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
