import { RefreshCw } from 'lucide-react'

interface RetryButtonProps {
  onClick: () => void
  isLoading?: boolean
  label?: string
}

export function RetryButton({ onClick, isLoading = false, label = 'Try Again' }: RetryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Retrying...' : label}
    </button>
  )
}
