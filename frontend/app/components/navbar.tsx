import {Search, Plus} from 'lucide-react';

type NavbarProps = {
  onMenuClick: () => void;
};

export default function Navbar({onMenuClick}: NavbarProps) {
  return (
  <>
    {/* Logo Section */}
    <div className="px-4 lg:px-5 pb-5 pt-5 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
            <div
            className="w-6 h-6 bg-blue-700 rounded"
            style={{
              clipPath:
              'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }}
            ></div>
          </div>
          <span className="text-xl font-bold text-gray-800">FileWise</span>
        </div>

        <div className="flex items-center justify-between">
          <img src="logo-croppy.png" alt="FileWise logo"/>
        </div>
      </div>
    </div>

    {/* Search and Menu Section */}
    <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
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

          <button className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg">
            <Plus className="w-5 h-5 text-gray-600"/>
          </button>

          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 lg:w-5 h-4 lg:h-5 text-gray-400"/>
            <input
            type="text"
            placeholder="Find name or place..."
            className="w-full pl-9 lg:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer"/>
          </label>
          <div className="hidden sm:flex items-center gap-2 lg:gap-3">
            <div
            className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-medium text-xs lg:text-sm">
              DR
            </div>
            <div className="hidden md:block text-sm">
              <div className="font-medium text-gray-900">Denise Rose</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}