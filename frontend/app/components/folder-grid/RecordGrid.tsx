/**
 * RecordGrid Component
 *
 * Displays a grid of file records with different views based on context:
 * - Shows purchase dates in Recent folder view
 * - Shows color-coded expiration dates in other views (red=expired, amber=expiring soon, gray=later)
 * - Supports trash/restore operations
 * - Displays metadata like company name, amount, and document type
 */

import {Link} from 'react-router'
import {FileText, Star, Calendar, DollarSign, Building2, Trash2, Pencil, RotateCcw} from 'lucide-react'
import type {Record} from '~/utils/models/record.model'
import {RecordSkeleton} from '../loading/RecordSkeleton'
import {ErrorDisplay} from '../error/ErrorDisplay'
import {EmptyState} from './EmptyState'

/**
 * Props interface for RecordGrid component
 */
interface RecordGridProps {
  records: Record[] | null                                        // Array of record objects to display, or null if not loaded
  isLoading: boolean                                              // Whether data is currently being fetched
  error: { message: string } | null                               // Error object if fetch failed
  onRetry: () => void                                             // Callback to retry failed data fetch
  emptyMessage?: string                                           // Custom message for empty state
  showTrashButton?: boolean                                       // Whether to show trash/delete button on cards
  onDeleteRecord?: (record: Record, event: React.MouseEvent) => void    // Handler for delete/trash action
  onRestoreRecord?: (record: Record, event: React.MouseEvent) => void   // Handler for restore action (Trash folder only)
  isTrashFolder?: boolean                                         // Whether we're viewing the Trash folder
  isDeleting?: boolean                                            // Whether a delete/restore operation is in progress
  isRecentFolder?: boolean                                        // Whether we're viewing the Recent folder
}

/**
 * RecordGrid Component
 * Main component that handles all display states and renders the record grid
 */
export function RecordGrid({
                             records,
                             isLoading,
                             error,
                             onRetry,
                             emptyMessage = 'No files yet',
                             showTrashButton = false,
                             onDeleteRecord,
                             onRestoreRecord,
                             isTrashFolder = false,
                             isDeleting = false,
                             isRecentFolder = false
                           }: RecordGridProps) {

  /**
   * Helper function to format date strings for display
   * @param dateString - ISO date string or null
   * @returns Formatted date string (e.g., "Jan 15, 2025") or null
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',  // Short month name (e.g., "Jan")
      day: 'numeric',  // Day of month (e.g., "15")
      year: 'numeric'  // Full year (e.g., "2025")
    })
  }

  // ========== LOADING STATE ==========
  // Show skeleton placeholders while data is being fetched
  if (isLoading) {
    return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Render 4 skeleton cards as loading placeholders */}
        {[1, 2, 3, 4].map((i) => (
        <RecordSkeleton key={i}/>
        ))}
      </div>
    </div>
    )
  }

  // ========== ERROR STATE ==========
  // Show error message with retry button if data fetch failed
  if (error) {
    return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 mb-4 px-1">Files</h2>
      <ErrorDisplay
      title="Failed to Load Files"
      message={error.message}
      type="error"
      onRetry={onRetry}  // Allow user to retry the failed request
      />
    </div>
    )
  }

  // ========== EMPTY STATE ==========
  // Show empty state message if no records exist
  if (!records || records.length === 0) {
    return (
    <></>
    )
  }

  // ========== SUCCESS STATE ==========
  // Render the grid of record cards with all metadata
  return (
  <div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Map through each record and render a card */}
      {records.map((record) => (
      <div key={record.id} className="relative">
        {/* Main clickable card that links to record details page */}
        <Link
        to={`./record/${record.id}`}
        className="group flex bg-white border border-gray-200 rounded-xl p-5 hover:border-cyan-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex flex-col h-full">


            {/* ========== HEADER SECTION ========== */}
            {/* Add padding at top to prevent icon overlap, show star if record is starred */}
            <div className="flex items-start justify-between mb-3 pt-8">
              {/* Star icon appears for starred records (except in Trash folder) */}
              {record.isStarred && !isTrashFolder ? (

              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/>
              ) : (
              <div/>
              )}
            </div>


            {/* ========== TITLE SECTION ========== */}
            {/* Display record name, fallback to "Untitled Document" if no name */}
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">

              {record.name || 'Untitled Document'}
            </h3>

            {/* ========== METADATA SECTION ========== */}
            {/* Display various metadata fields with icons */}
            <div className="mt-auto space-y-2">

              {/* Company Name */}
              {record.companyName && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Building2 className="w-3.5 h-3.5"/>
                <span className="truncate">{record.companyName}</span>
              </div>
              )}

              {/* Amount */}
              {record.amount !== null && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <DollarSign className="w-3.5 h-3.5"/>
                <span>${record.amount.toFixed(2)}</span>
              </div>
              )}


              {/* ========== DATE DISPLAY LOGIC ========== */}
              {/* Show different dates based on which folder we're viewing */}
              {/* RECENT FOLDER: Show only purchase date */}

                {isRecentFolder ? (
                record.purchaseDate && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="w-3.5 h-3.5"/>
                  <span className="truncate">
                          Purchased: {formatDate(record.purchaseDate)}
                        </span>
                </div>
                )
                ) : (
                <>

                {/* Show the expiration date with color coding in other folders */}
                {/* OTHER FOLDERS: Show expiration date with color coding */}

                  {record.expDate && (
                  <div className={`flex items-center gap-2 text-xs font-medium ${
                  // Calculate time difference to determine urgency color
                  new Date(record.expDate) < new Date()
                  ? 'text-red-600'      // RED: Already expired
                  : new Date(record.expDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  ? 'text-amber-600'  // AMBER: Expiring within 7 days
                  : 'text-gray-600'   // GRAY: Expiring later
                  }`}>
                    <Calendar className="w-3.5 h-3.5"/>
                    <span className="truncate">
                            Expires: {formatDate(record.expDate)}
                          </span>
                  </div>
                  )}


                  {/* FALLBACK: Show purchase date if no expiration date exists */}
                    {record.purchaseDate && !record.expDate && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5"/>
                      <span className="truncate">
                            {formatDate(record.purchaseDate)}
                          </span>
                    </div>
                    )}
                  </>
                    )}

                  {/* Document Type Badge */}
                  {record.docType && (
                  <div className="mt-2">
                      <span
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        {record.docType}
                      </span>
                  </div>
                  )}
                </div>
                </div>
                  </Link>

                {/* File icon - view details */}
                {/* ========== ACTION BUTTONS ========== */}
                {/* Floating action buttons in top-right corner of card */}
                <div className="absolute top-3 right-3 flex gap-2 z-10">

                {/* View Details Button (Green) - Always shown */}
                <Link
                to={`./record/${record.id}`}
                onClick={(e) => e.stopPropagation()}  // Prevent card link from triggering
                className="p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                title="View details"
                >
                  <FileText className="w-4 h-4 text-green-600"/>
                </Link>

                {/* Edit Button (Blue) - Show only if NOT in Trash folder */}

                  {!isTrashFolder && (
                  <Link
                  to={`/new-file-record?recordId=${record.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
                  title="Edit record"
                  >
                    <Pencil className="w-4 h-4 text-cyan-600"/>
                  </Link>
                  )}


                  {/* Restore Button (Amber) - Show only IN Trash folder */}
                    {isTrashFolder && onRestoreRecord && (
                    <button
                    onClick={(e) => onRestoreRecord(record, e)}
                    disabled={isDeleting}  // Disable during operations
                    className={`p-2 rounded-lg transition-colors ${
                    isDeleting
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-amber-50 hover:bg-amber-100'
                    }`}
                    title={isDeleting ? 'Processing...' : 'Restore file'}
                    >
                      <RotateCcw
                      className={`w-4 h-4 ${
                      isDeleting ? 'text-gray-400' : 'text-amber-600'
                      }`}
                      />
                    </button>
                    )}


                    {/* Trash/Delete Button - Behavior changes based on context */}
                      {showTrashButton && onDeleteRecord && (
                      <button
                      onClick={(e) => onDeleteRecord(record, e)}
                      disabled={isDeleting}
                      className={`p-2 rounded-lg transition-colors ${
                      isDeleting
                      ? 'bg-gray-200 cursor-not-allowed'
                      : isTrashFolder
                      ? 'bg-red-50 hover:bg-red-100'    // Red in Trash (permanent delete)
                      : 'bg-gray-50 hover:bg-gray-100'  // Gray elsewhere (move to trash)
                      }`}
                      title={isDeleting ? 'Processing...' : isTrashFolder ? 'Delete permanently' : 'Move to trash'}
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
          </div>
          ))}
      </div>
        </div>
        )
      }
