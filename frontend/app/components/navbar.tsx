import {Search, Plus, LogOut} from 'lucide-react';
import {Link, useLocation} from 'react-router';
import { Form } from 'react-router';

type NavbarProps = {
  onMenuClick: () => void;
  userEmail: string | null;
};

export function Navbar({onMenuClick, userEmail}: NavbarProps) {
  const location = useLocation()
  const currentPath = location.pathname

  // Get initials from email
  const getInitials = (email: string | null): string => {
    if (!email) return 'U'
    const username = email.split('@')[0]
    const parts = username.split(/[._-]/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return username.substring(0, 2).toUpperCase()
  }

  const userInitials = getInitials(userEmail)

  return (
  <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
    <div className="flex items-center justify-between gap-4">
      {/* Left: Mobile Menu + Logo */}
      <div className="flex items-center gap-2 lg:gap-6">
        {/* Mobile Menu Button */}
        <button
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        onClick={onMenuClick}
        >
          <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          >
            <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <img src="/logo-croppy.png" alt="FileWise logo" />
          </div>
          <span className="text-xl font-bold text-gray-800 hidden sm:inline">FileWise</span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-2xl relative">
        <button className="hidden lg:block absolute left-0 p-2 hover:bg-gray-100 rounded-lg">
          <Plus className="w-5 h-5 text-gray-600"/>
        </button>
        <Search className="absolute left-3 lg:left-14 top-1/2 transform -translate-y-1/2 w-4 lg:w-5 h-4 lg:h-5 text-gray-400"/>
        <input
        type="text"
        placeholder="Find name or place..."
        className="w-full pl-9 lg:pl-24 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Right: Navigation Links + User Profile + Sign Out */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-4">
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
        </div>

        {/* User Profile */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-medium text-xs lg:text-sm">
            {userInitials}
          </div>
          <div className="hidden md:block text-sm">
            <div className="font-medium text-gray-900">{userEmail?.split('@')[0] || 'User'}</div>
          </div>
        </div>

        {/* Sign Out Button */}
        <Form method="post" action="/sign-out">
          <button
          type="submit"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        </Form>
      </div>
    </div>
  </div>
  );
}
