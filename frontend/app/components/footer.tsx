import { Link } from 'react-router'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <div className="w-5 h-5 bg-white rounded flex items-center justify-center flex-shrink-0">
                <img src="/logo-croppy.png" alt="FileWise logo" />
              </div>
              <h3 className="font-bold text-cyan-700 text-xs">FileWise</h3>
            </div>
            <p className="text-xs text-cyan-700 leading-tight">
              Organize and manage your files with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-cyan-700 mb-1 text-xs">Quick Links</h3>
            <ul className="space-y-0.5">
              <li>

                <Link to="/" className="text-xs text-cyan-700 hover:text-cyan-800">
                  Home
                </Link>
              </li>
              <li>

                <Link to="/dashboard" className="text-xs text-cyan-700 hover:text-cyan-800">

                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-cyan-700 mb-1 text-xs">Legal</h3>
            <ul className="space-y-0.5">
              <li>

                <Link to="/privacy" className="text-xs text-cyan-700 hover:text-cyan-800">
                  Privacy Policy
                </Link>
              </li>
              <li>

                <Link to="/terms" className="text-xs text-cyan-700 hover:text-cyan-800">

                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-2 pt-2 border-t border-gray-200 text-center">
          <p className="text-xs text-cyan-700">
            &copy; {currentYear} FileWise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
