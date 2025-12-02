import { Outlet, useLocation } from 'react-router'
import { Navbar } from '~/components/navbar'
import { useState } from 'react'
import { useInactivityTimeout } from '~/hooks/useInactivityTimeout'
import { Footer } from '~/components/footer'

export default function RootLayout () {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const handleMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Don't enable timeout on auth pages
  const isAuthPage = location.pathname === '/sign-in' || location.pathname === '/sign-up'

  // Enable inactivity timeout on protected pages
  useInactivityTimeout({
    timeout: 15 * 60 * 1000, // 15 minutes for production
    enabled: !isAuthPage
  })

  return (
  <>
    <Navbar onMenuClick={handleMenuClick} userEmail={null} />
    <Outlet />
    <Footer />
  </>
  )
}
