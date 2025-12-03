import React, { useState, useEffect } from 'react'
import { Link, Outlet, redirect, useActionData, useLocation, useFetcher, useNavigate, useRevalidator } from 'react-router'
import type { Route } from './+types/dashboard'
import {
  type Folder,
  type NewFolder,
  NewFolderSchema,
  getFoldersByUserId,
  postFolder,
  updateFolder,
  deleteFolder
} from '~/utils/models/folder.model'
import type { Record } from '~/utils/models/record.model'
import { getSession } from '~/utils/session.server'
import { Search, Plus, FolderOpen, Star, RotateCw, ClockAlert, Trash2, Settings } from 'lucide-react'
import { AddFolderForm } from '~/routes/dashboard/add-folder-form'
import { SearchResultsModal } from '~/routes/dashboard/search-results-modal'
import { ErrorDisplay } from '~/components/error/ErrorDisplay'
import { FolderGrid } from '~/components/folder-grid/FolderGrid'
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
  try {

    // Check if the user is logged in using session
    const { isLoggedIn } = await import('~/utils/session.server')
    const loginStatus = await isLoggedIn(request)

    // If not logged in, redirect to sign-in
    if (loginStatus.status !== 200) {
      throw redirect('/sign-in')
    }

    const cookie = request.headers.get('cookie')
    const session = await getSession(cookie)
    const user = session.get('user')
    const authorization = session.get('authorization')

    if (!cookie || !user?.id || !authorization) {
      throw redirect('/sign-in')
    }

    const folders: Folder[] = await getFoldersByUserId(user.id, authorization, cookie)

    // Sort folders alphabetically by name
    const sortedFolders = folders.sort((a, b) => a.name.localeCompare(b.name))

    return { folders: sortedFolders, authorization, error: null }
  } catch (error) {
    // If it's a redirect, rethrow it
    if (error instanceof Response) throw error

    // Otherwise, return the error state
    return {
      folders: null,
      authorization: null,
      error: {
        message: error instanceof Error ? error.message : 'Failed to load folders'
      }
    }
  }
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

  // create a new folder object with the required attributes
  // User-created folders are top-level folders (parentFolderId: null)
  const folder = {
    id: uuid(),
    parentFolderId: null,
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

    const iconProps = { className: size === 'sm' ? "w-4 h-4" : "w-5 h-5 text-cyan-600" }

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

  // Get data from the loader
  let { folders, error } = loaderData
  if (!folders) folders = []

  useActionData<typeof action>()
  const location = useLocation()
  const searchFetcher = useFetcher<{ success: boolean, data: Record[], message: string }>()
  const revalidator = useRevalidator()
  const navigate = useNavigate()

  const [selectedFolder, setSelectedFolder] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [displayNewFolderForm, setDisplayNewFolderForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const isLoading = revalidator.state === 'loading'

  // Check if we're at the base dashboard route
  const isBaseDashboard = location.pathname === '/dashboard' || location.pathname === '/dashboard/'

  // Define the order of default folders
  const defaultFolderOrder = ['Expiring', 'Recent', 'Starred', 'Trash']

  // Separate default folders and user-created folders
  const defaultFolders = defaultFolderOrder
    .map(name => folders.find(f => f.name === name && f.parentFolderId === null))
    .filter((f): f is Folder => f !== undefined)

  // Get user-created folders (not default system folders)
  // On base dashboard, only show parent folders (parentFolderId === null)
  const userCreatedFolders = folders
    .filter(folder =>
      !['All Folders', 'Recent', 'Starred', 'Expiring', 'Trash'].includes(folder.name) &&
      folder.parentFolderId === null
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  // Handle retry
  const handleRetry = () => {
    revalidator.revalidate()
  }

  // Handle edit folder
  const handleEditFolder = (folder: Folder, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setEditingFolder(folder)
    setEditFolderName(folder.name)
  }

  // Handle save folder name
  const handleSaveFolderName = async () => {
    if (!editingFolder || !loaderData.authorization) return

    try {
      const updatedFolder: Folder = {
        ...editingFolder,
        name: editFolderName.trim()
      }

      const cookie = document.cookie
      await updateFolder(updatedFolder, loaderData.authorization, cookie)

      setEditingFolder(null)
      setEditFolderName('')
      revalidator.revalidate()
    } catch (error) {
      console.error('Failed to update folder:', error)
      alert(error instanceof Error ? error.message : 'Failed to update folder')
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingFolder(null)
    setEditFolderName('')
  }

  // Handle delete folder
  const handleDeleteFolder = async (folder: Folder, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!loaderData.authorization) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${folder.name}"? This action cannot be undone.`
    )

    if (!confirmDelete) return

    try {
      setIsDeleting(true)
      const cookie = document.cookie
      await deleteFolder(folder.id, loaderData.authorization, cookie)
      revalidator.revalidate()
    } catch (error) {
      console.error('Failed to delete folder:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete folder')
    } finally {
      setIsDeleting(false)
    }
  }

  // Auto-redirect on auth errors
  useEffect(() => {
    if (error && (error.message.includes('Unauthorized') || error.message.includes('sign in'))) {
      const timer = setTimeout(() => navigate('/sign-in'), 3000)
      return () => clearTimeout(timer)
    }
  }, [error, navigate])

  // Handle search with debouncing
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setShowSearchResults(false)
      return
    }

    console.log('[Search] Query entered:', searchQuery)
    setShowSearchResults(true)

    const timer = setTimeout(() => {
      console.log('[Search] Searching for:', searchQuery)
      // Use the fetcher to call the search resource route
      searchFetcher.load(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`)
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [searchQuery])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out`}>

        {/* Close Sidebar Button - Mobile Only */}
        <div className="lg:hidden px-4 py-3 border-b border-gray-200">
          <button
            aria-label="Close sidebar"
            className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Create Folder Button */}
        <div className="px-3 lg:px-4 pt-4">
          <button
            onClick={() => {
              setDisplayNewFolderForm(!displayNewFolderForm)
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-700 text-white rounded-lg hover:cursor-pointer hover:bg-cyan-700 transition-colors focus:outline-none text-sm font-medium"
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

            {/* All Folders Link */}
            <Link
              to="/dashboard"
              onClick={() => setSelectedFolder('All Folders')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isBaseDashboard
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 border border-transparent'
              }`}
            >
              {getFolderIcon('All Folders')}
              <span className="flex-1 text-left">All Folders</span>
            </Link>

            {/* Default Folders Only (in specific order) */}
            {defaultFolders.map((folder) => (
              <Link
                key={folder.id}
                to={`./${folder.id}`}
                onClick={() => setSelectedFolder(folder.name)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedFolder === folder.name
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm'
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-gray-700 hover:bg-gray-100 border border-transparent hover:cursor-pointer focus:bg-cyan-50 focus:text-cyan-700 focus:border-cyan-200 focus:shadow-sm">
            <Settings className="w-4 h-4"/>
            <span className="flex-1 text-left">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-gray-50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-50 lg:opacity-100' : 'opacity-100'}`}>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="h-full">

              {/* Checks URL */}
              {isBaseDashboard ? (

                // Main Dashboard
                <div className="p-4 lg:p-6">

                  {/* New Folder Button - Mobile Only */}
                  <button
                    onClick={() => {
                      setDisplayNewFolderForm(!displayNewFolderForm)
                    }}
                    className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-6 bg-cyan-700 text-white rounded-lg hover:cursor-pointer hover:bg-cyan-700 transition-colors focus:outline-none text-sm font-medium"
                  >
                    <Plus className="w-4 h-4"/>
                    <span>New Folder</span>
                  </button>

                  {/* Add Folder Form - Mobile Only */}
                  <div className="lg:hidden mb-6">
                    <AddFolderForm
                      displayNewFolderForm={displayNewFolderForm}
                      actionData={actionData}
                      setDisplayNewFolderForm={setDisplayNewFolderForm}
                    />
                  </div>

                  {/* Error display with auto-redirect */}
                  {error && (
                    <div className="mb-4">
                      <ErrorDisplay
                        title="Failed to Load Folders"
                        message={error.message}
                        type="error"
                        onRetry={handleRetry}
                        autoRedirect={
                          error.message.includes('Unauthorized') || error.message.includes('sign in')
                            ? { path: '/sign-in', delay: 3000 }
                            : undefined
                        }
                      />
                    </div>
                  )}

                  <div>
                    {/* Page Title */}
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">All Folders</h1>
                      <p className="text-sm text-gray-600">Browse all your folders and files in one place</p>
                    </div>

                    {/* Default Folders Section */}
                    <h2 className="text-sm font-semibold text-gray-900 mb-4 px-1">Quick Access</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                      {defaultFolders.map((folder) => (
                        <Link
                          key={folder.id}
                          to={`./${folder.id}`}
                          onClick={() => setSelectedFolder(folder.name)}
                          className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-cyan-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
                              {getFolderIcon(folder.name, 'md')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate group-hover:text-cyan-600 transition-colors">
                                {folder.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">System Folder</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* User-Created Folders Section */}
                    {userCreatedFolders.length > 0 && (
                      <>
                        <FolderGrid
                          folders={userCreatedFolders}
                          isLoading={isLoading && !folders}
                          error={null}
                          onRetry={handleRetry}
                          emptyMessage="No custom folders yet. Create a new folder to get started."
                          showActionButtons={true}
                          onEditFolder={handleEditFolder}
                          onDeleteFolder={handleDeleteFolder}
                          isDeleting={isDeleting}
                        />
                      </>
                    )}
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
                      A paragraph of text with an <span className="text-cyan-600 underline">unsupported link</span>.
                      A second row of text with a <span className="text-cyan-600 underline">web link</span>.
                      An icon of a <span className="text-cyan-600">profile</span> with info.
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
        results={(searchFetcher.data?.data as Record[]) || []}
        isLoading={searchFetcher.state === 'loading'}
        searchQuery={searchQuery}
      />

      {/* Edit Folder Modal */}
      {editingFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rename Folder</h2>
            <div className="mb-6">
              <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 mb-2">
                Folder Name
              </label>
              <input
                id="folder-name"
                type="text"
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveFolderName()
                  } else if (e.key === 'Escape') {
                    handleCancelEdit()
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                placeholder="Enter folder name"
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFolderName}
                disabled={!editFolderName.trim()}
                className="px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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
                        A paragraph of text with an <span className="text-cyan-600 underline">unsupported link</span>.
                        A second row of text with a <span className="text-cyan-600 underline">web link</span>.
                        An icon of a <span className="text-cyan-600">profile</span> with info.
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