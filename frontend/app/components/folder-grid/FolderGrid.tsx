/**
 * FolderGrid Component
 *
 * Displays a grid of folders with different actions based on context:
 * - Shows edit/delete buttons for user-created folders
 * - Shows restore button in Trash folder
 * - Supports empty state with optional action button (e.g., "Create Subfolder")
 */

import { Link } from 'react-router'
import { FolderOpen, Trash2, Pencil, RotateCcw } from 'lucide-react'
import type { Folder } from '~/utils/models/folder.model'
import { FolderSkeleton } from '../loading/FolderSkeleton'
import { ErrorDisplay } from '../error/ErrorDisplay'
import { EmptyState } from './EmptyState'

/**
 * Props interface for FolderGrid component
 */
interface FolderGridProps {
  folders: Folder[] | null                                          // Array of folder objects to display, or null if not loaded
  isLoading: boolean                                                // Whether data is currently being fetched
  error: { message: string } | null                                 // Error object if fetch failed
  onRetry: () => void                                               // Callback to retry failed data fetch
  emptyMessage?: string                                             // Custom message for empty state
  showActionButtons?: boolean                                       // Whether to show action buttons on folder cards
  onDeleteFolder?: (folder: Folder, event: React.MouseEvent) => void    // Handler for delete/trash action
  onEditFolder?: (folder: Folder, event: React.MouseEvent) => void      // Handler for edit/rename action
  onRestoreFolder?: (folder: Folder, event: React.MouseEvent) => void   // Handler for restore action (Trash folder only)
  isTrashFolder?: boolean                                           // Whether we're viewing the Trash folder
  isDeleting?: boolean                                              // Whether a delete/restore operation is in progress
  emptyAction?: {                                                   // Optional action button for empty state
    label: string                                                   // Button text (e.g., "Create Subfolder")
    onClick: () => void                                             // Callback when button is clicked
  }
}

/**
 * FolderGrid Component
 * Main component that handles all display states and renders the folder grid
 */
export function FolderGrid({
  folders,
  isLoading,
  error,
  onRetry,
  emptyMessage = 'No folders yet',
  showActionButtons = false,
  onDeleteFolder,
  onEditFolder,
  onRestoreFolder,
  isTrashFolder = false,
  isDeleting = false,
  emptyAction
}: FolderGridProps) {

  // ========== LOADING STATE ==========
  // Show skeleton placeholders while data is being fetched
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 px-1">Folders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Render 4 skeleton cards as loading placeholders */}
          {[1, 2, 3, 4].map((i) => (
            <FolderSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // ========== ERROR STATE ==========
  // Show error message with retry button if data fetch failed
  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 px-1">Folders</h2>
        <ErrorDisplay
          title="Failed to Load Folders"
          message={error.message}
          type="error"
          onRetry={onRetry}  // Allow user to retry the failed request
        />
      </div>
    )
  }

  // ========== EMPTY STATE ==========
  // Show empty state message if no folders exist
  // Optionally show an action button (e.g., "Create Subfolder")
  if (!folders || folders.length === 0) {
    return (
      <EmptyState
        icon={<FolderOpen className="w-16 h-16 text-gray-300" />}
        title="No folders yet"
        message={emptyMessage}
        action={emptyAction}  // Optional button to create a subfolder
      />
    )
  }

  // ========== SUCCESS STATE ==========
  // Render the grid of folder cards
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-900 mb-4 px-1">Folders</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Map through each folder and render a card */}
        {folders.map((folder) => (
          <div key={folder.id} className="relative">
            {/* Main clickable card that links to folder contents */}
            <Link
              to={`./${folder.id}`}
              className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 block min-h-[120px]"
            >
              <div className="flex items-start gap-3 pt-8">
                {/* Folder icon with blue background */}
                <div className="p-2.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                </div>

                {/* Folder name and label */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {folder.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Folder</p>
                </div>
              </div>
            </Link>

            {/* ========== ACTION BUTTONS ========== */}
            {/* Floating action buttons in top-right corner of card */}
            {/* Only show if showActionButtons prop is true (user-created folders) */}
            {showActionButtons && (
              <div className="absolute top-3 right-3 flex gap-2 z-10">

                {/* Edit/Rename Button (Blue) - Show only if NOT in Trash folder */}
                {!isTrashFolder && onEditFolder && (
                  <button
                    onClick={(e) => onEditFolder(folder, e)}
                    disabled={isDeleting}  // Disable during operations
                    className={`p-2 rounded-lg transition-colors ${
                      isDeleting
                        ? 'bg-gray-200 cursor-not-allowed'
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                    title={isDeleting ? 'Processing...' : 'Rename folder'}
                  >
                    <Pencil
                      className={`w-4 h-4 ${
                        isDeleting ? 'text-gray-400' : 'text-blue-600'
                      }`}
                    />
                  </button>
                )}

                {/* Restore Button (Amber) - Show only IN Trash folder */}
                {isTrashFolder && onRestoreFolder && (
                  <button
                    onClick={(e) => onRestoreFolder(folder, e)}
                    disabled={isDeleting}
                    className={`p-2 rounded-lg transition-colors ${
                      isDeleting
                        ? 'bg-gray-200 cursor-not-allowed'
                        : 'bg-amber-50 hover:bg-amber-100'
                    }`}
                    title={isDeleting ? 'Processing...' : 'Restore folder'}
                  >
                    <RotateCcw
                      className={`w-4 h-4 ${
                        isDeleting ? 'text-gray-400' : 'text-amber-600'
                      }`}
                    />
                  </button>
                )}

                {/* Trash/Delete Button - Behavior changes based on context */}
                {onDeleteFolder && (
                  <button
                    onClick={(e) => onDeleteFolder(folder, e)}
                    disabled={isDeleting}
                    className={`p-2 rounded-lg transition-colors ${
                      isDeleting
                        ? 'bg-gray-200 cursor-not-allowed'
                        : isTrashFolder
                          ? 'bg-red-50 hover:bg-red-100'    // Red in Trash (permanent delete)
                          : 'bg-gray-50 hover:bg-gray-100'  // Gray elsewhere (move to trash)
                    }`}
                    title={isDeleting ? 'Processing...' : isTrashFolder ? 'Delete permanently' : 'Delete folder'}
                  >
                    <Trash2
                      className={`w-4 h-4 ${
                        isDeleting
                          ? 'text-gray-400'
                          : isTrashFolder
                            ? 'text-red-600'   // Red in Trash
                            : 'text-gray-600'  // Gray elsewhere
                      }`}
                    />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
