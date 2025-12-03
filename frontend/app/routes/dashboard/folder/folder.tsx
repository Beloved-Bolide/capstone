import type { Route } from './+types/folder'
import { useLoaderData, useNavigate, useRevalidator, useFetcher, redirect } from 'react-router'
import { getFoldersByParentFolderId, getFolderById, postFolder } from '~/utils/models/folder.model'
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

export async function action ({ request }: Route.ActionArgs) {
  try {
    // Get session data
    const cookie = request.headers.get('cookie')
    const session = await getSession(cookie)
    const user = session.get('user')
    const authorization = session.get('authorization')

    // Check authentication
    if (!cookie || !user?.id || !authorization) {
      throw redirect('/sign-in')
    }

    // Get form data
    const formData = await request.formData()
    const folderName = formData.get('folderName') as string
    const parentFolderId = formData.get('parentFolderId') as string | null

    // Validate folder name
    if (!folderName || folderName.trim().length === 0) {
      return { success: false, error: 'Folder name is required' }
    }

    if (folderName.trim().length > 64) {
      return { success: false, error: 'Folder name must be 64 characters or less' }
    }

    // Create folder object
    const folder: Folder = {
      id: uuid(),
      parentFolderId: parentFolderId || null,
      userId: user.id,
      name: folderName.trim()
    }

    // Create the folder
    const { result } = await postFolder(folder, authorization, cookie)

    // Check if creation was successful
    if (result.status !== 200) {
      return { success: false, error: result.message || 'Failed to create folder' }
    }

    // Return success
    return { success: true, message: 'Folder created successfully' }
  } catch (error) {
    // Handle redirect
    if (error instanceof Response) throw error

    // Handle other errors
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create folder' }
  }
}

export async function loader ({ request, params }: Route.LoaderArgs) {
  try {
    // get the cookie, session, user, and authorization
    const cookie = request.headers.get('cookie')
    const session = await getSession(cookie)
    const user = session.get('user')
    const authorization = session.get('authorization')

    // if the cookie, user, or authorization is not found, redirect to sign-in
    if (!cookie || !user?.id || !authorization) {
      throw redirect('/sign-in')
    }

    // Get the splat parameter (everything after /dashboard/)
    const splat = params['*' as keyof typeof params] as string | undefined

    // Get the last segment as the current folder ID
    const segments = splat ? splat.split('/').filter(Boolean) : []
    const folderId = segments.length > 0 ? segments[segments.length - 1] : null

    // Fetch current folder first to check if it's a special folder
    const currentFolder = folderId ? await getFolderById(folderId, authorization, cookie) : null

    // Check which type of folder we're viewing
    const folderName = currentFolder?.name
    const isStarredFolder = folderName === 'Starred'
    const isExpiringFolder = folderName === 'Expiring'
    const isRecentFolder = folderName === 'Recent'

    // Fetch child folders and records
    // For special folders, get records using their specific logic
    const [childFolders, records] = await Promise.all([
      getFoldersByParentFolderId(folderId, authorization, cookie),
      isStarredFolder
        ? getStarredRecordsByUserId(user.id, authorization, cookie)
        : isExpiringFolder
          ? getExpiringRecordsByUserId(user.id, authorization, cookie)
          : isRecentFolder
            ? getRecentRecordsByUserId(user.id, authorization, cookie)
            : getRecordsByFolderId(folderId, authorization, cookie)
    ])

    // return the folder data
    return { childFolders, records, currentFolder, error: null }
  } catch (error) {
    // If it's a redirect, rethrow it
    if (error instanceof Response) throw error

    // Otherwise, return the error state
    return {
      childFolders: null,
      records: null,
      currentFolder: null,
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

  const { childFolders, records, currentFolder, error } = loaderData
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

  // Close modal on successful folder creation
  useEffect(() => {
    if (createFolderFetcher.data?.success) {
      revalidator.revalidate()
    }
  }, [createFolderFetcher.data, revalidator])

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
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{fetcher.data.error}</p>
        </div>
      )}

      {fetcher.data?.success && fetcher.data?.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
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
      {(childFolders || isLoading) && (
        <FolderGrid
          folders={childFolders}
          isLoading={isLoading && !childFolders}
          error={null}
          onRetry={handleRetry}
          emptyMessage="This folder has no subfolders. Add files or create subfolders to get started."
          // showTrashButton={true}
          onDeleteFolder={handleFolderDelete}
          isTrashFolder={isTrashFolder}
          isDeleting={isDeleting}
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
          isTrashFolder={isTrashFolder}
          isDeleting={isDeleting}
        />
      )}

      {/* Empty state when no folders and no records */}
      {!isLoading && !error && childFolders?.length === 0 && records?.length === 0 && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <FolderOpen className="w-16 h-16 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
          <p className="text-gray-500">This folder is empty. Add files or create subfolders to get started.</p>
        </div>
      )}

      {/* Create Subfolder Modal */}
      {showCreateFolderModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCreateFolderModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {createFolderFetcher.data?.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{createFolderFetcher.data.error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateFolderModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubfolder}
                disabled={!newFolderName.trim() || createFolderFetcher.state !== 'idle'}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {createFolderFetcher.state !== 'idle' ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}