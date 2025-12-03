import { AlertCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { RetryButton } from './RetryButton'

interface ErrorDisplayProps {
  title: string
  message: string
  type?: 'error' | 'warning' | 'info'
  onRetry?: () => void
  onDismiss?: () => void
  autoRedirect?: {
    path: string
    delay: number
  }
}

export function ErrorDisplay({
  title,
  message,
  type = 'error',
  onRetry,
  onDismiss,
  autoRedirect
}: ErrorDisplayProps) {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState<number | null>(
    autoRedirect ? Math.floor(autoRedirect.delay / 1000) : null
  )

  useEffect(() => {
    if (!autoRedirect) return

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          navigate(autoRedirect.path)
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [autoRedirect, navigate])

  const bgColor = {
    error: 'bg-red-50',
    warning: 'bg-yellow-50',
    info: 'bg-blue-50'
  }[type]

  const borderColor = {
    error: 'border-red-200',
    warning: 'border-yellow-200',
    info: 'border-blue-200'
  }[type]

  const textColor = {
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  }[type]

  const iconColor = {
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }[type]

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${textColor} mb-1`}>{title}</h3>
          <p className={`text-sm ${textColor}`}>{message}</p>

          {countdown !== null && (
            <p className={`text-sm ${textColor} mt-2 font-medium`}>
              Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          )}

          {onRetry && (
            <div className="mt-3">
              <RetryButton onClick={onRetry} />
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Dismiss"
          >
            <X className={`w-5 h-5 ${iconColor}`} />
          </button>
        )}
      </div>
    </div>
  )
}
