import type { Route } from './+types/folder'
import { useLoaderData, useNavigate, useRevalidator, useFetcher, redirect } from 'react-router'
import { getFoldersByParentFolderId, getFolderById } from '~/utils/models/folder.model'
import React, { useEffect } from 'react'
import { getSession } from '~/utils/session.server'
import type { Folder } from '~/utils/models/folder.model'
import { getRecordsByFolderId, type Record } from '~/utils/models/record.model'
import { FolderGrid } from '~/components/folder-grid/FolderGrid'
import { RecordGrid } from '~/components/folder-grid/RecordGrid'
import { ErrorDisplay } from '~/components/error/ErrorDisplay'
import { FolderOpen } from 'lucide-react'


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

    // If the URL contains '/record/', this is a record detail page, not a folder page
    // Return empty data to avoid trying to load folder contents
    if (splat && splat.includes('/record/')) {
      return { childFolders: [], records: [], currentFolder: null, error: null }
    }

    // Get the last segment as the current folder ID
    const segments = splat ? splat.split('/').filter(Boolean) : []
    const folderId = segments.length > 0 ? segments[segments.length - 1] : null

    // Fetch all data in parallel
    const [currentFolder, childFolders, records] = await Promise.all([
      folderId ? getFolderById(folderId, authorization, cookie) : null,
      getFoldersByParentFolderId(folderId, authorization, cookie),
      getRecordsByFolderId(folderId, authorization, cookie)
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

  // Check if we're in the Trash folder
  const isTrashFolder = currentFolder?.name === 'Trash'

  // Handle retry
  const handleRetry = () => {
    revalidator.revalidate()
  }

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
    </div>
  )
}