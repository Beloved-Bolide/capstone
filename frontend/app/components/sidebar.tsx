import React, {useState} from "react";
import {Clock, FileText, FolderOpen, Plus, Settings, Star, Trash2} from "lucide-react";


type Receipt = {
  id: number;
  name: string;
  date: string;
  category: string;
  folder: string;
};

export default function Sidebar() {

  const [selectedFolder, setSelectedFolder] = useState('All Folders');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const openPreview = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  const folders = [
    {name: 'All Folders', icon: FolderOpen, count: 18},
    {name: 'Receipts', icon: FileText, count: 12},
    {name: 'Warranties', icon: FileText, count: 3},
    {name: 'Taxes', icon: FileText, count: 2},
    {name: 'Manuals', icon: FileText, count: 1},
    {name: 'Coupons', icon: FileText, count: 0},
  ];

  const receipts = [
    {id: 1, name: 'Costco', date: 'Oct 7th', category: 'Grocery', folder: 'Receipts'},
    {id: 2, name: 'Smiths', date: 'Oct 5th', category: 'Grocery', folder: 'Receipts'},
    {id: 3, name: 'Cheddar\'s', date: 'Oct 4th', category: 'Restaurant', folder: 'Receipts'},
    {id: 4, name: 'BestBuy', date: 'Oct 3rd', category: 'Electronics', folder: 'Warranties'},
    {id: 5, name: 'Amazon', date: 'Oct 3rd', category: 'Online', folder: 'Receipts'},
    {id: 6, name: 'ETSY', date: 'Oct 3rd', category: 'Online', folder: 'Receipts'},
    {id: 7, name: 'Amazon', date: 'Oct 2nd', category: 'Online', folder: 'Receipts'},
    {id: 8, name: 'Walmart', date: 'Oct 2nd', category: 'Grocery', folder: 'Receipts'},
    {id: 9, name: 'Walmart', date: 'Oct 1st', category: 'Online', folder: 'Receipts'},
    {id: 10, name: 'Macbook', date: 'Oct 3rd', category: 'BestBuy', folder: 'Warranties'},
    {id: 11, name: '2024 taxes', date: 'April 8th', category: 'Turbo Tax', folder: 'Taxes'},
    {id: 12, name: 'Macbook', date: 'Oct 3rd', category: 'Bestbuy', folder: 'Manuals'},
    {id: 13, name: 'Vacuum Cleaner', date: 'Dyson.com', category: '', folder: 'Coupons'},
    {id: 14, name: 'Subway', date: '-', category: 'Restaurant', folder: 'Coupons'},
    {id: 15, name: 'Great Clips', date: '-', category: 'Grooming', folder: 'Coupons'},
  ];

  const receiptDetail = {
    store: 'ABC Store',
    address: '123 Main St, Anytown USA',
    date: '10/20/25',
    time: '14:35:22',
    items: [
      {name: 'Face and hair Serum calms', qty: 1, price: 109.00, amount: 109.00},
      {name: 'Soap and scrotal salve', qty: 1, price: 52.50, amount: 52.50},
      {name: 'Leather Desk', qty: 1, price: 6.00, amount: 6.00},
    ],
    subtotal: 167.50,
    salesTax: 6.58,
    total: 154.06,
  };

  return (

  <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out`}>

    {/* Logo */}
    <div className="px-4 lg:px-5 pb-5 pt-5 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-blue-700 rounded" style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
            }}></div>
          </div>
          <span className="text-xl font-bold text-gray-800">FileWise</span>
        </div>
        <button
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        onClick={() => setSidebarOpen(false)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    {/* Create Folder Button */}
    <div className="px-3 lg:px-4 pt-4">
      <button
      className="w-full flex items-center justify-center gap-2 px-3 lg:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
        <Plus className="w-4 h-4"/>
        <span className="hidden sm:inline">Create New Folder</span>
        <span className="sm:hidden">New Folder</span>
      </button>
    </div>

    {/* Folders */}
    <div className="flex-1 overflow-y-auto px-3 lg:px-4 py-4">
      <div className="space-y-1">
        {folders.map((folder) => (
        <button
        key={folder.name}
        onClick={() => setSelectedFolder(folder.name)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        selectedFolder === folder.name
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-700 hover:bg-gray-50'
        }`}
        >
          <folder.icon className="w-4 h-4"/>
          <span className="flex-1 text-left">{folder.name}</span>
          {folder.count > 0 && (
          <span className="text-xs text-gray-500">{folder.count}</span>
          )}
        </button>
        ))}
        <button
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Plus className="w-4 h-4"/>
          <span className="flex-1 text-left">Create New Folder</span>
        </button>
      </div>

      {/* Quick Access */}
      <div className="mt-6 space-y-1">
        <button
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Star className="w-4 h-4"/>
          <span className="flex-1 text-left">Starred</span>
        </button>
        <button
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Clock className="w-4 h-4"/>
          <span className="flex-1 text-left">Recent</span>
        </button>
        <button
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <FileText className="w-4 h-4"/>
          <span className="flex-1 text-left">Expenses</span>
        </button>
        <button
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Clock className="w-4 h-4"/>
          <span className="flex-1 text-left">Expiring</span>
        </button>
        <button
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Trash2 className="w-4 h-4"/>
          <span className="flex-1 text-left">Trash</span>
        </button>
      </div>
    </div>

    {/* Settings */}
    <div className="p-4 border-t border-gray-200">
      <button
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
        <Settings className="w-4 h-4"/>
        <span className="flex-1 text-left">Settings</span>
      </button>
    </div>
  </div>
  )
}