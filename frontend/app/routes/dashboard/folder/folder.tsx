import type { Route } from './+types/folder'
import { Link, useLoaderData, useNavigate, useRevalidator, useFetcher } from 'react-router'
import { getFoldersByParentFolderId, getFolderById, getFolderByName, deleteFolder, moveFolderToTrash } from '~/utils/models/folder.model'
import React, { useState } from 'react'
import {  FileText, FolderOpen, Star, Calendar, DollarSign, Building2, Trash2 } from 'lucide-react'
import { getSession } from '~/utils/session.server'
import type { Folder } from '~/utils/models/folder.model'
import { getRecordsByFolderId, deleteRecord, moveRecordToTrash, type Record } from '~/utils/models/record.model'


export async function loader ({ request, params }: Route.LoaderArgs) {

  // get the cookie, session, user, and authorization
  const cookie = request.headers.get('cookie')
  const session = await getSession(cookie)
  const user = session.get('user')
  const authorization = session.get('authorization')

  // if the cookie, user, or authorization is not found, return an error
  if (!cookie || !user?.id || !authorization) {
    return { childFolders: null, records: null, currentFolder: null, trashFolder: null }
  }

  // Get the splat parameter (everything after /dashboard/)
  const splat = params['*' as keyof typeof params] as string | undefined

  // Get the last segment as the current folder ID
  const segments = splat ? splat.split('/').filter(Boolean) : []
  const folderId = segments.length > 0 ? segments[segments.length - 1] : null

  // get current folder details
  const currentFolder: Folder | null = folderId ? await getFolderById(folderId, authorization, cookie) : null

  // get child folders and records
  const childFolders: Folder[] = await getFoldersByParentFolderId(folderId, authorization, cookie)
  const records: Record[] = await getRecordsByFolderId(folderId, authorization, cookie)

  // return the folder data
  return { childFolders, records, currentFolder }
}

export default function Folder ({ loaderData }: Route.ComponentProps) {

  useLoaderData<typeof loader>()
  const fetcher = useFetcher<{ success: boolean, error?: string, message?: string }>()
  const isDeleting = fetcher.state !== 'idle'

  const { childFolders, records, currentFolder } = loaderData
  if (!childFolders || !records) return <div className="p-6 text-center text-gray-500">Files not found.</div>

  // Check if we're in the Trash folder
  const isTrashFolder = currentFolder?.name === 'Trash'

  // format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

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

    if (!confirm(`Are you sure you want to permanently delete "${folderName}" and all its contents? This action cannot be undone.`)) {
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

  const hasContent = childFolders.length > 0 || records.length > 0

  return (
    <div className="p-4 lg:p-4">
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

      {!hasContent ? (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
          <p className="text-gray-500">This folder is empty. Add files or create subfolders to get started.</p>
        </div>
      ) : (
        <>
          {/* Folders Section */}
          {childFolders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 px-1">Folders</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {childFolders.map((folder) => (
                  <div key={folder.id} className="relative">
                    <Link
                      to={`./${folder.id}`}
                      className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 block"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <FolderOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {folder.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">Folder</p>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => isTrashFolder
                        ? handleDeleteFolder(folder.id, folder.name, e)
                        : handleMoveFolderToTrash(folder, e)
                      }
                      disabled={isDeleting}
                      className={`absolute top-3 right-3 p-2 rounded-lg transition-colors z-10 ${
                        isDeleting
                          ? 'bg-gray-200 cursor-not-allowed'
                          : isTrashFolder
                            ? 'bg-red-50 hover:bg-red-100'
                            : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      title={isDeleting ? 'Processing...' : isTrashFolder ? 'Delete permanently' : 'Move to trash'}
                    >
                      <Trash2 className={`w-4 h-4 ${
                        isDeleting
                          ? 'text-gray-400'
                          : isTrashFolder
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Records Section */}
          {records.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4 px-1">Files</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {records.map((record) => (
                  <div key={record.id} className="relative">
                    <Link
                      to={`./record/${record.id}`}
                      className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 block"
                    >
                      <div className="flex flex-col h-full">

                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2.5 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                          {record.isStarred && !isTrashFolder && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {record.name || 'Untitled Document'}
                        </h3>

                        {/* Metadata */}
                        <div className="mt-auto space-y-2">
                          {record.companyName && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Building2 className="w-3.5 h-3.5" />
                              <span className="truncate">{record.companyName}</span>
                            </div>
                          )}
                          {record.amount !== null && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>${record.amount.toFixed(2)}</span>
                            </div>
                          )}
                          {(record.purchaseDate || record.expDate) && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="truncate">
                                {formatDate(record.purchaseDate || record.expDate)}
                              </span>
                            </div>
                          )}
                          {record.docType && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                {record.docType}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => isTrashFolder
                        ? handleDeleteRecord(record.id, record.name || 'Untitled Document', e)
                        : handleMoveRecordToTrash(record, e)
                      }
                      disabled={isDeleting}
                      className={`absolute top-3 right-3 p-2 rounded-lg transition-colors z-10 ${
                        isDeleting
                          ? 'bg-gray-200 cursor-not-allowed'
                          : isTrashFolder
                            ? 'bg-red-50 hover:bg-red-100'
                            : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      title={isDeleting ? 'Processing...' : isTrashFolder ? 'Delete permanently' : 'Move to trash'}
                    >
                      <Trash2 className={`w-4 h-4 ${
                        isDeleting
                          ? 'text-gray-400'
                          : isTrashFolder
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}