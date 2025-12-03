import { Link } from 'react-router'
import { FileText, Star, Calendar, DollarSign, Building2, Trash2, Pencil, RotateCcw } from 'lucide-react'
import type { Record } from '~/utils/models/record.model'
import { RecordSkeleton } from '../loading/RecordSkeleton'
import { ErrorDisplay } from '../error/ErrorDisplay'
import { EmptyState } from './EmptyState'

interface RecordGridProps {
  records: Record[] | null
  isLoading: boolean
  error: { message: string } | null
  onRetry: () => void
  emptyMessage?: string
  showTrashButton?: boolean
  onDeleteRecord?: (record: Record, event: React.MouseEvent) => void
  onRestoreRecord?: (record: Record, event: React.MouseEvent) => void
  isTrashFolder?: boolean
  isDeleting?: boolean
  isRecentFolder?: boolean
}

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

  // Helper function to format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <RecordSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-4 px-1">Files</h2>
        <ErrorDisplay
          title="Failed to Load Files"
          message={error.message}
          type="error"
          onRetry={onRetry}
        />
      </div>
    )
  }

  // Empty state
  if (!records || records.length === 0) {
    return (
      <></>
    )
  }

  // Success state with records
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {records.map((record) => (
          <div key={record.id} className="relative">
            <Link
              to={`./record/${record.id}`}
              className="group flex bg-white border border-gray-200 rounded-xl p-5 hover:border-cyan-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col h-full">

                {/* Header with a star */}
                <div className="flex items-start justify-between mb-3">
                  {record.isStarred && !isTrashFolder ? (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <div className="mb-4"/>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">
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

                  {/* Show only purchase date in the Recent folder */}
                  {isRecentFolder ? (
                    record.purchaseDate && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="truncate">
                          Purchased: {formatDate(record.purchaseDate)}
                        </span>
                      </div>
                    )
                  ) : (
                    <>

                      {/* Show the expiration date with color coding in other folders */}
                      {record.expDate && (
                        <div className={`flex items-center gap-2 text-xs font-medium ${
                          new Date(record.expDate) < new Date()
                            ? 'text-red-600'
                            : new Date(record.expDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                              ? 'text-amber-600'
                              : 'text-gray-600'
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="truncate">
                            Expires: {formatDate(record.expDate)}
                          </span>
                        </div>
                      )}

                      {/* Show the purchase date as fallback */}
                      {record.purchaseDate && !record.expDate && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="truncate">
                            {formatDate(record.purchaseDate)}
                          </span>
                        </div>
                      )}
                    </>
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

            {/* Action buttons container */}
            <div className="absolute top-3 right-3 flex gap-2 z-10">

              {/* File icon - view details */}
              <Link
                to={`./record/${record.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                title="View details"
              >
                <FileText className="w-4 h-4 text-green-600" />
              </Link>

              {/* Edit button - show only if not in the trash folder */}
              {!isTrashFolder && (
                <Link
                  to={`/new-file-record?recordId=${record.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
                  title="Edit record"
                >
                  <Pencil className="w-4 h-4 text-cyan-600" />
                </Link>
              )}

              {/* Restore button - show only in the trash folder */}
              {isTrashFolder && onRestoreRecord && (
                <button
                  onClick={(e) => onRestoreRecord(record, e)}
                  disabled={isDeleting}
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

              {/* Trash button */}
              {showTrashButton && onDeleteRecord && (
                <button
                  onClick={(e) => onDeleteRecord(record, e)}
                  disabled={isDeleting}
                  className={`p-2 rounded-lg transition-colors ${
                    isDeleting
                      ? 'bg-gray-200 cursor-not-allowed'
                      : isTrashFolder
                        ? 'bg-red-50 hover:bg-red-100'
                        : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  title={isDeleting ? 'Processing...' : isTrashFolder ? 'Delete permanently' : 'Move to trash'}
                >
                  <Trash2
                    className={`cursor-pointer w-4 h-4 ${
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
          </div>
        ))}
      </div>
    </div>
  )
}
