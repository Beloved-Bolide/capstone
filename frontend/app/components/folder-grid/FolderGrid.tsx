import { Link } from 'react-router'
import { FolderOpen, Trash2 } from 'lucide-react'
import type { Folder } from '~/utils/models/folder.model'
import { FolderSkeleton } from '../loading/FolderSkeleton'
import { ErrorDisplay } from '../error/ErrorDisplay'
import { EmptyState } from './EmptyState'

interface FolderGridProps {
  folders: Folder[] | null
  isLoading: boolean
  error: { message: string } | null
  onRetry: () => void
  emptyMessage?: string
  showTrashButton?: boolean
  onDeleteFolder?: (folder: Folder, event: React.MouseEvent) => void
  isTrashFolder?: boolean
  isDeleting?: boolean
}

export function FolderGrid({
  folders,
  isLoading,
  error,
  onRetry,
  emptyMessage = 'No folders yet',
  showTrashButton = false,
  onDeleteFolder,
  isTrashFolder = false,
  isDeleting = false
}: FolderGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 px-1">Folders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <FolderSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 px-1">Folders</h2>
        <ErrorDisplay
          title="Failed to Load Folders"
          message={error.message}
          type="error"
          onRetry={onRetry}
        />
      </div>
    )
  }

  // Empty state
  if (!folders || folders.length === 0) {
    return (
      <EmptyState
        icon={<FolderOpen className="w-16 h-16 text-gray-300" />}
        title="No folders yet"
        message={emptyMessage}
      />
    )
  }

  // Success state with folders
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-900 mb-4 px-1">Folders</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {folders.map((folder) => (
          <div key={folder.id} className="relative">
            <Link
              to={`./${folder.id}`}
              className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-cyan-300 hover:shadow-md transition-all duration-200 block"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
                  <FolderOpen className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-cyan-600 transition-colors">
                    {folder.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Folder</p>
                </div>
              </div>
            </Link>
            {showTrashButton && onDeleteFolder && (
              <button
                onClick={(e) => onDeleteFolder(folder, e)}
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
                <Trash2
                  className={`w-4 h-4 ${
                    isDeleting
                      ? 'text-gray-400'
                      : isTrashFolder
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
