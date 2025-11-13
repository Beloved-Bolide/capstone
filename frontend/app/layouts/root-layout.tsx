import {Outlet} from 'react-router'
import {Navbar} from '~/components/navbar'

export default function RootLayout() {
  const handleMenuClick = () => {
    // Handle mobile menu toggle
    console.log('Menu clicked')
  }

  return (
  <>
    {/*<Navbar onMenuClick={handleMenuClick}/>*/}
    <Outlet/>
  </>
  )
}