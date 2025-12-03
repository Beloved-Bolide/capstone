import { Loader } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  }

  return (
    <div className="flex items-center justify-center gap-3 py-6">
      <div className={`relative ${sizeClasses[size]}`}>
        <Loader className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
      </div>
      {message && (
        <span className="text-sm font-medium text-gray-700">
          {message}
        </span>
      )}
    </div>
  )
}
