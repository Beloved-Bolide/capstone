import React, { useState, useEffect } from 'react'
import { Link, Outlet, useActionData, useLocation } from 'react-router'
import type { Route } from './+types/dashboard'
import {
  type Folder,
  type NewFolder,
  NewFolderSchema,
  getFoldersByUserId,
  postFolder
} from '~/utils/models/folder.model'
import { searchRecords, type Record } from '~/utils/models/record.model'
import { getSession } from '~/utils/session.server'
import { Search, Plus, FolderOpen, Star, RotateCw, ClockAlert, Trash2, Settings } from 'lucide-react'
import { AddFolderForm } from '~/routes/dashboard/folder/add-folder-form'
import { SearchResultsModal } from '~/routes/dashboard/search-results-modal'
import { getValidatedFormData } from 'remix-hook-form'
import { v7 as uuid } from 'uuid'
import { zodResolver } from '@hookform/resolvers/zod'

export function meta ({}: Route.MetaArgs) {
  return [
    { title: 'Dashboard - FileWise' },
    { name: 'Your FileWise Dashboard' }
  ]
}

const resolver = zodResolver(NewFolderSchema)

export async function loader ({ request }: Route.LoaderArgs) {

  const cookie = request.headers.get('cookie')
  const session = await getSession(cookie)
  const user = session.get('user')
  const authorization = session.get('authorization')

  if (!cookie || !user?.id || !authorization) {
    return { folders: null, authorization: null }
  }

  const folders: Folder[] = await getFoldersByUserId(user.id, authorization, cookie)
  return { folders, authorization }
}

export async function action ({ request }: Route.ActionArgs) {

  // get the form data from the request body
  const { errors, data, receivedValues: defaultValues } = await getValidatedFormData<NewFolder>(request, resolver)

  // if there are errors, return them
  if (errors) {
    return { errors, defaultValues }
  }

  // get the cookie, user, and authorization from the session
  const cookie = request.headers.get('cookie')
  const session = await getSession(cookie)
  const user = session.get('user')
  const authorization = session.get('authorization')

  // if the user or authorization is not found, return an error
  if (!cookie || !user?.id || !authorization) {
    return {
      success: false, status: {
        status: 401,
        data: null,
        message: 'Unauthorized'
      }
    }
  }

  // get the folders for the current user
  const folders: Folder[] | null = await getFoldersByUserId(user.id, authorization, cookie)

  // if there are folders, find the "All Folders" parent folder
  let allFoldersParent: Folder | null | undefined = null
  if (folders) {
    allFoldersParent = folders.find(f => f.name === 'All Folders' && f.parentFolderId === null)
  }

  // find the parent folder of the selected folder
  const allFoldersId = allFoldersParent ? allFoldersParent.id : null

  // create a new folder object with the required attributes
  const folder = {
    id: uuid(),
    parentFolderId: allFoldersId, // needs work
    userId: user.id,
    name: data.name
  }

  // post the folder to the server
  const { result } = await postFolder(folder, authorization, cookie)

  // if the post-request fails, return an error
  if (result.status !== 200) {
    return { success: false, status: result }
  }

  // return a success message
  return {
    success: true,
    status: {
      status: result.status,
      data: result.data,
      message: 'Folder created successfully!'
    }
  }
}

export default function Dashboard ({ loaderData, actionData }: Route.ComponentProps) {

  const receiptDetail = {
    store: 'ABC Store',
    address: '123 Main St, Anytown USA',
    date: '10/20/25',
    time: '14:35:22',
    items: [
      { name: 'Face and hair Serum calms', qty: 1, price: 109.00, amount: 109.00 },
      { name: 'Soap and face wash', qty: 1, price: 52.50, amount: 52.50 },
      { name: 'Leather Desk', qty: 1, price: 6.00, amount: 6.00 }
    ],
    subtotal: 167.50,
    salesTax: 6.58,
    total: 154.06
  }

  const getFolderIcon = (folderName: string, size: 'sm' | 'md' = 'sm') => {

    const iconProps = { className: size === 'sm' ? "w-4 h-4" : "w-5 h-5 text-blue-600" }

    switch (folderName) {
      case 'All Folders':
        return <FolderOpen {...iconProps} />
      case 'Starred':
        return <Star {...iconProps} />
      case 'Recent':
        return <RotateCw {...iconProps} />
      case 'Expiring':
        return <ClockAlert {...iconProps} />
      case 'Trash':
        return <Trash2 {...iconProps} />
      default:
        return <FolderOpen {...iconProps} />
    }
  }

  // if there are no folders, set the array to an empty array
  let { folders } = loaderData
  if (!folders) folders = []

  useActionData<typeof action>()
  const location = useLocation()

  const [selectedFolder, setSelectedFolder] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [displayNewFolderForm, setDisplayNewFolderForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Record[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Check if we're at the base dashboard route
  const isBaseDashboard = location.pathname === '/dashboard' || location.pathname === '/dashboard/'

  // Filter parent folders excluding Trash
  const parentFolders = folders.filter(folder => folder.parentFolderId === null && folder.name !== 'Trash')

  // Handle search with debounce
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    console.log('[Search] Query entered:', searchQuery)

    // Show loading state immediately
    setIsSearching(true)
    setShowSearchResults(true)

    const timer = setTimeout(async () => {
      try {
        const cookie = document.cookie
        const session = loaderData
        const authorization = session?.authorization || ''

        console.log('[Search] Searching for:', searchQuery)
        console.log('[Search] Authorization available:', !!authorization)

        if (!authorization) {
          console.error('[Search] No authorization token found')
          setSearchResults([])
          setIsSearching(false)
          return
        }

        const results = await searchRecords(searchQuery, authorization, cookie)
        console.log('[Search] Results received:', results)
        setSearchResults(results || [])
      } catch (error) {
        console.error('[Search] API Error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [searchQuery, loaderData])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out`}>

        {/* Logo */}
        <div className="px-4 lg:px-6 py-3 lg:pt-5 lg:pb-4.5 border-b border-gray-200">
          <div className="flex items-center justify-between h-[42px]">
            <Link to=".." className="flex items-center gap-2">
              <div className="w-10.5 h-10.5 rounded-md flex items-center justify-center">
                <img src="/logo-croppy.png" alt="logo"/>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                FileWise
              </span>
            </Link>
            <button
              aria-label="Close sidebar"
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Create Folder Button */}
        <div className="px-3 lg:px-4 pt-4">
          <button
            onClick={() => {
              setDisplayNewFolderForm(!displayNewFolderForm)
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:cursor-pointer hover:bg-blue-700 transition-colors focus:outline-none text-sm font-medium"
          >
            <Plus className="w-4 h-4"/>
            <span>New Folder</span>
          </button>
        </div>

        {/* Folders */}
        <div className="flex-1 overflow-y-auto px-3 lg:px-4 py-4">
          <div className="space-y-1">

            {/* Add Folder Form */}
            <AddFolderForm
              displayNewFolderForm={displayNewFolderForm}
              actionData={actionData}
              setDisplayNewFolderForm={setDisplayNewFolderForm}
            />

            {/* Folders */}
            {folders.filter(folder => folder.parentFolderId === null).map((folder) => (
              <Link
                key={folder.id}
                to={`./${folder.id}`}
                onClick={() => setSelectedFolder(folder.name)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedFolder === folder.name
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
              >
                {getFolderIcon(folder.name)}
                <span className="flex-1 text-left">{folder.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="px-3 lg:px-4 py-4 border-t border-gray-200">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-gray-700 hover:bg-gray-100 border border-transparent hover:cursor-pointer focus:bg-blue-50 focus:text-blue-700 focus:border-blue-200 focus:shadow-sm">
            <Settings className="w-4 h-4"/>
            <span className="flex-1 text-left">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-gray-50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-50 lg:opacity-100' : 'opacity-100'}`}>

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-3">
          <div className="flex items-center justify-between gap-3 lg:gap-4">
            <div className="flex items-center gap-3 lg:gap-5 flex-1 min-w-0">

              {/* Mobile Menu Button */}
              <button
                aria-label="Open sidebar"
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                <input
                  type="text"
                  placeholder="Search files and folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* New File Button */}
              <Link
                aria-label="Add new file"
                to="/new-file-record"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none text-sm font-medium"
              >
                <Plus className="w-4 h-4"/>
                <span className="hidden sm:inline">New File</span>
              </Link>
            </div>

            {/* User Profile */}
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:cursor-pointer">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm shadow-sm">
                DR
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="h-full">

              {/* Checks URL */}
              {isBaseDashboard ? (

                // Main Dashboard
                <div className="p-4 lg:p-6">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 mb-4 px-1">All Folders</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {parentFolders.map((folder) => (
                        <Link
                          key={folder.id}
                          to={`./${folder.id}`}
                          onClick={() => setSelectedFolder(folder.name)}
                          className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                              {getFolderIcon(folder.name, 'md')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {folder.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">Folder</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (

                // All Folders Dashboard
                <Outlet/>
              )}
            </div>
          </div>

          {/* Receipt Preview - Desktop */}
          <div className="hidden xl:block w-96 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
            <div className="bg-white rounded-md shadow-sm p-4 lg:p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">receipt</h3>
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">LOGO</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs mb-1">RECEIPT #</div>
                    <div className="font-medium">12345</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">RECEIPT DATE</div>
                    <div className="font-medium">1-5-17</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">TIME</div>
                    <div className="font-medium">14:35:22</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">DUE DATE</div>
                    <div className="font-medium">2/28/2017</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-gray-500 text-xs mb-1">BILL TO</div>
                  <div className="text-sm">
                    <div className="font-medium">ABC Store</div>
                    <div className="text-gray-600">123 Main Street</div>
                    <div className="text-gray-600">New York, NY 10001</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-gray-500 text-xs mb-1">SHIP TO</div>
                  <div className="text-sm">
                    <div className="font-medium">ABC Store</div>
                    <div className="text-gray-600">123 Main Street</div>
                    <div className="text-gray-600">New York, NY 10001</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <table className="w-full text-sm">
                  <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs font-semibold text-gray-600">QTY</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-600">DESCRIPTION</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-600">UNIT PRICE
                    </th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-600">AMOUNT</th>
                  </tr>
                  </thead>
                  <tbody>
                  {receiptDetail.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2">{item.qty}</td>
                      <td className="py-2 text-gray-700">{item.name}</td>
                      <td className="py-2 text-right">{item.price.toFixed(2)}</td>
                      <td className="py-2 text-right">{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${receiptDetail.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sales Tax 5.875%</span>
                    <span className="font-medium">${receiptDetail.salesTax.toFixed(2)}</span>
                  </div>
                  <div
                    className="flex justify-between text-lg font-bold border-t-2 border-gray-900 pt-2">
                    <span>TOTAL</span>
                    <span>${receiptDetail.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <div className="text-2xl font-bold mb-2">Auth-Smith</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="font-semibold text-sm mb-3">TERMS & CONDITIONS</div>
                <div className="space-y-3 text-xs text-gray-600">
                  <div>
                    <div className="font-semibold mb-1">A Subtitle</div>
                    <div>Some text</div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">A Subtitle</div>
                    <div>
                      A paragraph of text with an <span className="text-blue-600 underline">unsupported link</span>.
                      A second row of text with a <span className="text-blue-600 underline">web link</span>.
                      An icon of a <span className="text-blue-600">profile</span> with info.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Modal */}
      <SearchResultsModal
        isOpen={showSearchResults}
        onClose={() => {
          setShowSearchResults(false)
          setSearchQuery('')
        }}
        results={searchResults}
        isLoading={isSearching}
        searchQuery={searchQuery}
      />

      {/* Mobile Receipt Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 xl:hidden flex items-end sm:items-center justify-center">
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-t-xl rounded-t-xl max-h-[90vh] overflow-y-auto">
            <div
              className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Receipt Details</h2>
              <button
                aria-label="Close preview"
                onClick={() => setPreviewOpen(false)}
                className="p-2 rounded-lg hover:cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-4 lg:p-6">
              <div className="bg-white rounded-md shadow-sm p-4 lg:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">receipt</h3>
                  <div
                    className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">LOGO</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">RECEIPT #</div>
                      <div className="font-medium">12345</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">RECEIPT DATE</div>
                      <div className="font-medium">1-5-17</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">TIME</div>
                      <div className="font-medium">14:35:22</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">DUE DATE</div>
                      <div className="font-medium">2/28/2017</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-gray-500 text-xs mb-1">BILL TO</div>
                    <div className="text-sm">
                      <div className="font-medium">ABC Store</div>
                      <div className="text-gray-600">123 Main Street</div>
                      <div className="text-gray-600">New York, NY 10001</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-gray-500 text-xs mb-1">SHIP TO</div>
                    <div className="text-sm">
                      <div className="font-medium">ABC Store</div>
                      <div className="text-gray-600">123 Main Street</div>
                      <div className="text-gray-600">New York, NY 10001</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-xs font-semibold text-gray-600">QTY</th>
                        <th className="text-left py-2 text-xs font-semibold text-gray-600">DESCRIPTION</th>
                        <th className="text-right py-2 text-xs font-semibold text-gray-600">PRICE</th>
                        <th className="text-right py-2 text-xs font-semibold text-gray-600">AMOUNT</th>
                      </tr>
                      </thead>
                      <tbody>
                      {receiptDetail.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2">{item.qty}</td>
                          <td className="py-2 text-gray-700">{item.name}</td>
                          <td className="py-2 text-right">{item.price.toFixed(2)}</td>
                          <td className="py-2 text-right">{item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${receiptDetail.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sales Tax 5.875%</span>
                      <span className="font-medium">${receiptDetail.salesTax.toFixed(2)}</span>
                    </div>
                    <div
                      className="flex justify-between text-lg font-bold border-t-2 border-gray-900 pt-2">
                      <span>TOTAL</span>
                      <span>${receiptDetail.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <div className="text-2xl font-bold mb-2">Auth-Smith</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="font-semibold text-sm mb-3">TERMS & CONDITIONS</div>
                  <div className="space-y-3 text-xs text-gray-600">
                    <div>
                      <div className="font-semibold mb-1">A Subtitle</div>
                      <div>Some text</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">A Subtitle</div>
                      <div>
                        A paragraph of text with an <span className="text-blue-600 underline">unsupported link</span>.
                        A second row of text with a <span className="text-blue-600 underline">web link</span>.
                        An icon of a <span className="text-blue-600">profile</span> with info.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}