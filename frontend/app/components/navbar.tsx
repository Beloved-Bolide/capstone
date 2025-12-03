import { Search, Plus, LogOut, Menu, X } from 'lucide-react'
import { Link, useLocation, useFetcher } from 'react-router'
import { Form } from 'react-router'
import { useState, useEffect } from 'react'
import { SearchResultsModal } from '~/routes/dashboard/search-results-modal'
import type { Record } from '~/utils/models/record.model'

type NavbarProps = {
  onMenuClick: () => void
  userEmail: string | null
}

export function Navbar ({ onMenuClick, userEmail }: NavbarProps) {
  const location = useLocation()
  const currentPath = location.pathname
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const searchFetcher = useFetcher<{ success: boolean, data: Record[], message: string }>()

  // Check if we're on a public (unauthenticated) page
  const isPublicPage = currentPath === '/' || currentPath === '/sign-in' || currentPath === '/sign-up'

  // Handle search with debouncing
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setShowSearchResults(false)
      return
    }

    setShowSearchResults(true)

    const timer = setTimeout(() => {
      // Use the fetcher to call the search resource route
      searchFetcher.load(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`)
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [searchQuery])

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between gap-4">

          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <img src="/logo-croppy.png" alt="FileWise logo"/>
                </div>
                <span
                  className="hidden text-2xl font-bold bg-gradient-to-r from-cyan-700 to-cyan-600 bg-clip-text text-transparent md:block">FileWise</span>
              </div>
            </div>
          </Link>

          {/* Center: Search Bar (only shown on authenticated pages) */}
          {!isPublicPage && (
            <div className="flex-1 max-w-2xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>
          )}

          {/* Right: Buttons based on the page type */}
          <div className="flex items-center gap-3 lg:gap-6">
            {isPublicPage ? (

              /* Public Pages: Sign In and Sign Up buttons */
              <>
                {currentPath !== '/sign-in' && (
                  <Link
                    to="/sign-in"
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-cyan-700 transition-colors"
                  >
                    Sign In
                  </Link>
                )}
                {currentPath !== '/sign-up' && (
                  <Link
                    to="/sign-up"
                    className="px-4 py-2.5 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition-colors text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                )}
              </>
            ) : (
              /* Authenticated Pages: New File, Navigation, Sign Out */
              <>
                {/* New File Button */}
                <Link
                  aria-label="Add new file"
                  to="/new-file-record"
                  className="flex items-center gap-2 px-4 py-2.5 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition-colors focus:outline-none text-sm font-medium"
                >
                  <Plus className="w-4 h-4"/>
                  <span className="hidden sm:inline">New File</span>
                </Link>

                {/* Mobile Dropdown Menu Button */}
                <button
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                  {showMobileMenu ? (
                    <X className="w-5 h-5 text-gray-600"/>
                  ) : (
                    <Menu className="w-5 h-5 text-gray-600"/>
                  )}
                </button>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-4">
              {currentPath !== '/' && (
                <Link
                to="/"
                className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                >
                  Home
                </Link>
              )}
              {currentPath !== '/dashboard' && !currentPath.startsWith('/dashboard/') && (
                <Link
                to="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
              )}
              {currentPath !== '/expenses' && (
                <Link
                  to="/expenses"
                  className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                >
                  Expenses
                </Link>
              )}
            </div>

                {/* Desktop Sign Out Button */}
                <Form method="post" action="/sign-out" className="hidden lg:block">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4"/>
                    <span>Sign Out</span>
                  </button>
                </Form>
              </>
            )}
          </div>
        </div>

    {/* Mobile Dropdown Menu (only shown on authenticated pages) */}
    {!isPublicPage && showMobileMenu && (
      <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 space-y-2">
        {/* Navigation Links */}
        {currentPath !== '/' && (
          <Link
            to="/"
            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setShowMobileMenu(false)}
          >
            Home
          </Link>
        )}
        {currentPath !== '/dashboard' && !currentPath.startsWith('/dashboard/') && (
          <Link
            to="/dashboard"
            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setShowMobileMenu(false)}
          >
            Dashboard
          </Link>
        )}
        {currentPath !== '/expenses' && (
          <Link
            to="/expenses"
            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setShowMobileMenu(false)}
          >
            Expenses
          </Link>
        )}

            {/* Divider */}
            <div className="my-2 border-t border-gray-200"></div>

            {/* Sign Out Button */}
            <Form method="post" action="/sign-out" className="block">
              <button
                type="submit"
                className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4"/>
                Sign Out
              </button>
            </Form>
          </div>
        )}
      </div>

      {/* Search Results Modal (only shown on authenticated pages) */}
      {!isPublicPage && (
        <SearchResultsModal
          isOpen={showSearchResults}
          onClose={() => {
            setShowSearchResults(false)
            setSearchQuery('')
          }}
          results={(searchFetcher.data?.data as Record[]) || []}
          isLoading={searchFetcher.state === 'loading'}
          searchQuery={searchQuery}
        />
      )}
    </>
  );
}