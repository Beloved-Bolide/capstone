import { Outlet } from 'react-router'
import { Navbar } from '~/components/navbar'
import { useState } from 'react'
import { Footer } from '~/components/footer'

export default function RootLayout () {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <Navbar onMenuClick={handleMenuClick} userEmail={null}/>
      <Outlet/>
      <Footer/>
    </>
  )
}
