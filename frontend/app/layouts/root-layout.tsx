import { Outlet, useLocation } from 'react-router'
import { Navbar } from '~/components/navbar'
import { useState } from 'react'
import { useInactivityTimeout } from '~/hooks/useInactivityTimeout'

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
    timeout: 1 * 60 * 1000, // 1 minute for testing
    enabled: !isAuthPage
  })

  return (
  <>
    <Navbar onMenuClick={handleMenuClick} />
    <Outlet />
  </>
  )
}
