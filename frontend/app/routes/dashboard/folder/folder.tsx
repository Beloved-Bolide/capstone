/**
 * Folder Route Component
 *
 * This route handles displaying the contents of a folder (subfolders and records).
 * It supports special folder types (Starred, Recent, Expiring, Trash) with custom logic.
 *
 * Key Features:
 * - Loads folder data via loader function (server-side)
 * - Creates subfolders via action function
 * - Handles moving items to trash and restoring them
 * - Shows different data based on folder type:
 *   - Starred: Only starred records
 *   - Expiring: Records expiring within 2 weeks
 *   - Recent: 12 most recently purchased records
 *   - Trash: Deleted items with restore/permanent delete options
 *   - Regular folders: Child folders and records
 */

import type { Route } from './+types/folder'
import { useLoaderData, useNavigate, useRevalidator, useFetcher, redirect } from 'react-router'
import { getFoldersByParentFolderId, getFolderById, postFolder, updateFolder } from '~/utils/models/folder.model'
import React, { useEffect, useState } from 'react'
import { getSession } from '~/utils/session.server'
import type { Folder } from '~/utils/models/folder.model'
import {
  getExpiringRecordsByUserId, getRecentRecordsByUserId,
  getRecordsByFolderId,
  getStarredRecordsByUserId,
  type Record
} from '~/utils/models/record.model'
import { FolderGrid } from '~/components/folder-grid/FolderGrid'
import { RecordGrid } from '~/components/folder-grid/RecordGrid'
import { ErrorDisplay } from '~/components/error/ErrorDisplay'
import { FolderOpen, FolderPlus, X } from 'lucide-react'
import { v7 as uuid } from 'uuid'

/**
 * ACTION FUNCTION
 *
 * Handles form submissions to create new subfolders
 * This runs on the server when a user submits the "Create Subfolder" form
 *
 * @param request - Contains the form data with folderName and parentFolderId
 * @returns Success object with message, or error object with error message
 */
export async function action ({ request }: Route.ActionArgs) {
  try {
    // Extract authentication data from session cookie
    const cookie = request.headers.get('cookie')
    const session = await getSession(cookie)
    const user = session.get('user')
    const authorization = session.get('authorization')

    // Verify user is authenticated, redirect to sign-in if not
    if (!cookie || !user?.id || !authorization) {
      throw redirect('/sign-in')
    }

    // Extract form data
    const formData = await request.formData()
    const folderId = formData.get('folderId') as string | null
    const folderName = formData.get('folderName') as string
    const parentFolderId = formData.get('parentFolderId') as string | null

    // Validate folder name is provided
    if (!folderName || folderName.trim().length === 0) {
      return { success: false, error: 'Folder name is required' }
    }

    // Validate folder name length (max 64 characters)
    if (folderName.trim().length > 64) {
      return { success: false, error: 'Folder name must be 64 characters or less' }
    }

    // Check if this is an update (has folderId) or create (no folderId)
    if (folderId) {
      // UPDATE existing folder
      const folder: Folder = {
        id: folderId,
        parentFolderId: parentFolderId || null,
        userId: user.id,
        name: folderName.trim()
      }

      await updateFolder(folder, authorization, cookie)
      return { success: true, message: 'Folder updated successfully' }
    } else {
      // CREATE new folder
      const folder: Folder = {
        id: uuid(),                       // Generate unique ID using UUID v7
        parentFolderId: parentFolderId || null,  // Set parent folder (null = root level)
        userId: user.id,                  // Associate with current user
        name: folderName.trim()           // Clean up folder name
      }

      // Send POST request to create folder in database
      const { result } = await postFolder(folder, authorization, cookie)

      // Check if creation was successful (status 200)
      if (result.status !== 200) {
        return { success: false, error: result.message || 'Failed to create folder' }
      }

      return { success: true, message: 'Folder created successfully' }
    }
  } catch (error) {
    // Re-throw redirect responses (used for authentication)
    if (error instanceof Response) throw error

    // Handle and return other errors
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update folder' }
  }
}

/**
 * LOADER FUNCTION
 *
 * Fetches folder and record data before rendering the component (server-side)
 * Determines folder type and loads appropriate data:
 * - Regular folders: Load child folders and records by folder ID
 * - Special folders: Load specific filtered records from across all folders
 *
 * @param request - HTTP request with authentication cookie
 * @param params - URL parameters containing folder ID path
 * @returns Object with childFolders, records, currentFolder, and error state
 */
export async function loader ({ request, params }: Route.LoaderArgs) {
  try {
    // Extract authentication data from session cookie
    const cookie = request.headers.get('cookie')
    const session = await getSession(cookie)
    const user = session.get('user')
    const authorization = session.get('authorization')

    // Verify user is authenticated, redirect to sign-in if not
    if (!cookie || !user?.id || !authorization) {
      throw redirect('/sign-in')
    }

    // Parse the URL to extract the folder ID
    // URL pattern: /dashboard/folder/{folderId} or /dashboard/folder/{parentId}/{childId}
    const splat = params['*' as keyof typeof params] as string | undefined

    // Split path into segments and get the last one as current folder ID
    const segments = splat ? splat.split('/').filter(Boolean) : []
    const folderId = segments.length > 0 ? segments[segments.length - 1] : null

    // Fetch the current folder's metadata to check if it's a special folder
    const currentFolder = folderId ? await getFolderById(folderId, authorization, cookie) : null

    // Determine folder type by name to apply special logic
    const folderName = currentFolder?.name
    const isStarredFolder = folderName === 'Starred'    // Show only starred records
    const isExpiringFolder = folderName === 'Expiring'  // Show records expiring within 2 weeks
    const isRecentFolder = folderName === 'Recent'      // Show 12 most recently purchased records

    // Fetch both child folders and records in parallel for performance
    // Use different record-fetching logic based on folder type
    const [childFolders, records] = await Promise.all([
      // Always fetch child folders for the current folder
      getFoldersByParentFolderId(folderId, authorization, cookie),

      // Fetch records based on folder type:
      isStarredFolder
        ? getStarredRecordsByUserId(user.id, authorization, cookie)        // All starred records
        : isExpiringFolder
          ? getExpiringRecordsByUserId(user.id, authorization, cookie)     // Records expiring soon
          : isRecentFolder
            ? getRecentRecordsByUserId(user.id, authorization, cookie)     // 12 most recent records
            : getRecordsByFolderId(folderId, authorization, cookie)        // Regular folder records
    ])

    // Return successful data load
    return { childFolders, records, currentFolder, authorization, error: null }
  } catch (error) {
    // If it's a redirect, rethrow it
    if (error instanceof Response) throw error

    // Otherwise, return the error state
    return {
      childFolders: null,
      records: null,
      currentFolder: null,
      authorization: null,
      error: {
        message: error instanceof Error ? error.message : 'Failed to load folder contents'
      }
    }
  }
}

export default function Folder ({ loaderData }: Route.ComponentProps) {

  useLoaderData<typeof loader>()
  const fetcher = useFetcher<{ success: boolean, error?: string, message?: string }>()
  const revalidator = useRevalidator()
  const navigate = useNavigate()

  const { childFolders, records, currentFolder, authorization, error } = loaderData
  const isDeleting = fetcher.state !== 'idle'
  const isLoading = revalidator.state === 'loading'

  // Check if we're in special folders
  const isTrashFolder = currentFolder?.name === 'Trash'
  const isRecentFolder = currentFolder?.name === 'Recent'

  // Check if this is a user-created folder (not a system folder)
  const systemFolders = ['Starred', 'Recent', 'Expiring', 'Trash']
  const isUserFolder = currentFolder && !systemFolders.includes(currentFolder.name)

  // State for create subfolder modal
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const createFolderFetcher = useFetcher()

  // State for edit folder modal
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const editFolderFetcher = useFetcher()

  // Handle retry
  const handleRetry = () => {
    revalidator.revalidate()
  }

  // Handle create subfolder
  const handleCreateSubfolder = () => {
    if (!newFolderName.trim() || !currentFolder) return

    const formData = new FormData()
    formData.append('folderName', newFolderName.trim())
    formData.append('parentFolderId', currentFolder.id)

    createFolderFetcher.submit(formData, { method: 'post' })
    setNewFolderName('')
    setShowCreateFolderModal(false)
  }

  // Handle edit folder
  const handleEditFolder = (folder: Folder, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setEditingFolder(folder)
    setEditFolderName(folder.name)
  }

  // Handle save folder name
  const handleSaveFolderName = () => {
    if (!editingFolder) return

    const formData = new FormData()
    formData.append('folderId', editingFolder.id)
    formData.append('folderName', editFolderName.trim())
    formData.append('parentFolderId', editingFolder.parentFolderId || '')

    editFolderFetcher.submit(formData, { method: 'post' })
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingFolder(null)
    setEditFolderName('')
  }

  // Close modal on successful folder creation
  useEffect(() => {
    if (createFolderFetcher.data?.success) {
      revalidator.revalidate()
    }
  }, [createFolderFetcher.data, revalidator])

  // Close modal on successful folder update
  useEffect(() => {
    if (editFolderFetcher.data?.success) {
      setEditingFolder(null)
      setEditFolderName('')
      revalidator.revalidate()
    }
  }, [editFolderFetcher.data, revalidator])

  // Auto-redirect on auth errors
  useEffect(() => {
    if (error && (error.message.includes('Unauthorized') || error.message.includes('sign in'))) {
      const timer = setTimeout(() => navigate('/sign-in'), 3000)
      return () => clearTimeout(timer)
    }
  }, [error, navigate])

  // Handle moving folder to trash
  const handleMoveFolderToTrash = (folder: Folder, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const formData = new FormData()
    formData.append('actionType', 'moveToTrash')
    formData.append('itemType', 'folder')
    formData.append('itemId', folder.id)

    fetcher.submit(formData, { method: 'post', action: '/api/delete-item' })
  }

  // Handle moving record to trash
  const handleMoveRecordToTrash = (record: Record, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const formData = new FormData()
    formData.append('actionType', 'moveToTrash')
    formData.append('itemType', 'record')
    formData.append('itemId', record.id)
    formData.append('record', JSON.stringify(record))

    fetcher.submit(formData, { method: 'post', action: '/api/delete-item' })
  }

  // Handle permanent delete for folders
  const handleDeleteFolder = (folderId: string, folderName: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!confirm(`⚠️ PERMANENT DELETE WARNING ⚠️\n\nYou are about to permanently delete "${folderName}" and ALL of its contents:\n• All subfolders (recursively)\n• All files inside\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?`)) {
      return
    }

    const formData = new FormData()
    formData.append('actionType', 'permanentDelete')
    formData.append('itemType', 'folder')
    formData.append('itemId', folderId)

    fetcher.submit(formData, { method: 'post', action: '/api/delete-item' })
  }

  // Handle permanent delete for records
  const handleDeleteRecord = (recordId: string, recordName: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!confirm(`Are you sure you want to permanently delete "${recordName || 'this file'}"? This action cannot be undone.`)) {
      return
    }

    const formData = new FormData()
    formData.append('actionType', 'permanentDelete')
    formData.append('itemType', 'record')
    formData.append('itemId', recordId)

    fetcher.submit(formData, { method: 'post', action: '/api/delete-item' })
  }

  // Handle restore folder
  const handleRestoreFolder = (folder: Folder, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const formData = new FormData()
    formData.append('actionType', 'restore')
    formData.append('itemType', 'folder')
    formData.append('itemId', folder.id)

    fetcher.submit(formData, { method: 'post', action: '/api/delete-item' })
  }

  // Handle restore record
  const handleRestoreRecord = (record: Record, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const formData = new FormData()
    formData.append('actionType', 'restore')
    formData.append('itemType', 'record')
    formData.append('itemId', record.id)
    formData.append('record', JSON.stringify(record))

    fetcher.submit(formData, { method: 'post', action: '/api/delete-item' })
  }

  // Wrapper functions for grid components
  const handleFolderDelete = (folder: Folder, event: React.MouseEvent) => {
    if (isTrashFolder) {
      handleDeleteFolder(folder.id, folder.name, event)
    } else {
      handleMoveFolderToTrash(folder, event)
    }
  }

  const handleRecordDelete = (record: Record, event: React.MouseEvent) => {
    if (isTrashFolder) {
      handleDeleteRecord(record.id, record.name || 'Untitled Document', event)
    } else {
      handleMoveRecordToTrash(record, event)
    }
  }

  return (
    <div className="p-4 lg:p-4">

      {/* Fetcher status messages */}
      {fetcher.data?.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{fetcher.data.error}</p>
        </div>
      )}

      {fetcher.data?.success && fetcher.data?.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">{fetcher.data.message}</p>
        </div>
      )}

      {/* Error display with auto-redirect */}
      {error && (
        <div className="mb-4">
          <ErrorDisplay
            title="Failed to Load Folder"
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

      {/* Folders Grid */}
      {/* Only show folder grid for user folders, or when there are actual child folders */}
      {(childFolders || isLoading) && (isUserFolder || (childFolders && childFolders.length > 0)) && (
        <FolderGrid
          folders={childFolders}
          isLoading={isLoading && !childFolders}
          error={null}
          onRetry={handleRetry}
          emptyMessage="This folder has no subfolders. Add files or create subfolders to get started."
          showActionButtons={true}
          onEditFolder={handleEditFolder}
          onDeleteFolder={handleFolderDelete}
          onRestoreFolder={handleRestoreFolder}
          isTrashFolder={isTrashFolder}
          isDeleting={isDeleting}
          emptyAction={isUserFolder ? {
            label: 'Create Subfolder',
            onClick: () => setShowCreateFolderModal(true)
          } : undefined}
        />
      )}

      {/* Records Grid */}
      {(records || isLoading) && (
        <RecordGrid
          records={records}
          isLoading={isLoading && !records}
          error={null}
          onRetry={handleRetry}
          emptyMessage="No files in this folder yet."
          showTrashButton={true}
          onDeleteRecord={handleRecordDelete}
          onRestoreRecord={handleRestoreRecord}
          isTrashFolder={isTrashFolder}
          isDeleting={isDeleting}
          isRecentFolder={isRecentFolder}
        />
      )}

      {/* Create Subfolder Modal */}
      {showCreateFolderModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCreateFolderModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-cyan-600" />
                <h2 className="text-xl font-semibold text-gray-900">Create Subfolder</h2>
              </div>
              <button
                onClick={() => setShowCreateFolderModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label htmlFor="subfolder-name" className="block text-sm font-medium text-gray-700 mb-2">
                Subfolder Name
              </label>
              <input
                id="subfolder-name"
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateSubfolder()
                  } else if (e.key === 'Escape') {
                    setShowCreateFolderModal(false)
                  }
                }}
                placeholder="Enter subfolder name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {createFolderFetcher.data?.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{createFolderFetcher.data.error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateFolderModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubfolder}
                disabled={!newFolderName.trim() || createFolderFetcher.state !== 'idle'}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {createFolderFetcher.state !== 'idle' ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Folder Modal */}
      {editingFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rename Folder</h2>
            <div className="mb-6">
              <label htmlFor="edit-folder-name" className="block text-sm font-medium text-gray-700 mb-2">
                Folder Name
              </label>
              <input
                id="edit-folder-name"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                placeholder="Enter folder name"
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFolderName}
                disabled={!editFolderName.trim()}
                className="px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}