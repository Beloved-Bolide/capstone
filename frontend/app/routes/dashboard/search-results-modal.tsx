import React from 'react'
import { Link } from 'react-router'
import { X, Loader } from 'lucide-react'
import type { Record } from '~/utils/models/record.model'

interface SearchResultsModalProps {
  isOpen: boolean
  onClose: () => void
  results: Record[]
  isLoading: boolean
  searchQuery: string
}

export function SearchResultsModal ({
  isOpen,
  onClose,
  results,
  isLoading,
  searchQuery
}: SearchResultsModalProps) {

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none">
        <div className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl max-h-[600px] overflow-hidden flex flex-col pointer-events-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {isLoading ? 'Searching...' : `Results for "${searchQuery}"`}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close search results"
            >
              <X className="w-5 h-5 text-gray-500"/>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader className="w-5 h-5 text-blue-600 animate-spin"/>
                  <span className="text-sm text-gray-600">Searching...</span>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">No results found for "{searchQuery}"</p>
                  <p className="text-gray-500 text-xs mt-1">Try searching with different keywords</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {results.map((record) => (
                  <Link
                    key={record.id}
                    to={`/dashboard/${record.folderId}/record/${record.id}`}
                    onClick={onClose}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {record.name || 'Unnamed Record'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                          {record.companyName && (
                            <>
                              <span>{record.companyName}</span>
                              <span>•</span>
                            </>
                          )}
                          {record.docType && (
                            <>
                              <span>{record.docType}</span>
                              <span>•</span>
                            </>
                          )}
                          {record.amount && (
                            <span>${record.amount.toFixed(2)}</span>
                          )}
                        </div>
                        {record.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {record.description}
                          </p>
                        )}
                      </div>
                      {record.isStarred && (
                        <div className="text-yellow-400">★</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isLoading && results.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
              Showing {results.length} result{results.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </>
  )
}