import React from 'react'
import { Link } from 'react-router'
import { X, Loader, Search, FileText, Building2, DollarSign, Calendar } from 'lucide-react'
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
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pointer-events-none px-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl max-h-[70vh] overflow-hidden flex flex-col pointer-events-auto border border-gray-100">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-white">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Search className="w-5 h-5 text-cyan-600 flex-shrink-0"/>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isLoading ? 'Searching your files...' : 'Search Results'}
                </h2>
                {searchQuery && (
                  <p className="text-xs text-gray-500 truncate">for "{searchQuery}"</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0 ml-2"
              aria-label="Close search results"
            >
              <X className="w-5 h-5 text-gray-400"/>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <LoadingState query={searchQuery} />
            ) : results.length === 0 ? (
              <EmptyState query={searchQuery} />
            ) : (
              <ResultsList results={results} onClose={onClose} />
            )}
          </div>

          {/* Footer */}
          {!isLoading && results.length > 0 && (
            <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 text-xs text-gray-600 font-medium">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function LoadingState ({ query }: { query: string }) {
  return (
    <div className="p-8 space-y-6">
      {/* Animated spinner */}
      <div className="flex items-center justify-center gap-3 py-6">
        <div className="relative w-5 h-5">
          <Loader className="w-5 h-5 text-cyan-600 animate-spin"/>
        </div>
        <span className="text-sm font-medium text-gray-700">Searching for "<span className="font-semibold text-gray-900">{query}</span>"...</span>
      </div>

      {/* Skeleton loaders */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 p-4 bg-gray-50 rounded-md">
            <div className="flex items-start gap-4">
              {/* Icon skeleton */}
              <div className="w-10 h-10 bg-gray-200 rounded-md flex-shrink-0 animate-pulse"></div>

              {/* Content skeleton */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-gray-500 pt-4">
        This usually takes less than a second...
      </div>
    </div>
  )
}

function EmptyState ({ query }: { query: string }) {
  return (
    <div className="flex items-center justify-center py-16 px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400"/>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-600 text-sm mb-1">
          We couldn't find any files matching "<span className="font-medium">{query}</span>"
        </p>
        <p className="text-gray-500 text-xs">
          Try different keywords, check spelling, or browse your folders
        </p>
      </div>
    </div>
  )
}

function ResultsList ({ results, onClose }: { results: Record[], onClose: () => void }) {
  return (
    <div className="divide-y divide-gray-100">
      {results.map((record) => (
        <Link
          key={record.id}
          to={`/dashboard/${record.folderId}/record/${record.id}`}
          onClick={onClose}
          className="block px-6 py-4 hover:bg-cyan-50 transition-colors group border-l-4 border-transparent hover:border-cyan-600"
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="mt-1 flex-shrink-0">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center group-hover:from-cyan-200 group-hover:to-cyan-100 transition-colors">
                <FileText className="w-5 h-5 text-cyan-600"/>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors truncate text-base">
                  {record.name || 'Unnamed Record'}
                </h3>
                {record.isStarred && (
                  <span className="text-yellow-400 text-lg flex-shrink-0">★</span>
                )}
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
                {record.companyName && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400"/>
                    <span className="truncate">{record.companyName}</span>
                  </div>
                )}
                {record.docType && (
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-400"/>
                    <span>{record.docType}</span>
                  </div>
                )}
                {record.amount && (
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400"/>
                    <span>${record.amount.toFixed(2)}</span>
                  </div>
                )}
                {record.purchaseDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400"/>
                    <span>{new Date(record.purchaseDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {record.description && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  {record.description}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}