import { useEffect, useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

interface UseInactivityTimeoutOptions {
  timeout: number // in milliseconds
  onTimeout?: () => void
  enabled?: boolean
}

export function useInactivityTimeout({
  timeout,
  onTimeout,
  enabled = true
}: UseInactivityTimeoutOptions) {
  const navigate = useNavigate()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // Handle redirect via useEffect
  useEffect(() => {
    if (shouldRedirect) {
      window.location.href = '/sign-in?timeout=true'
    }
  }, [shouldRedirect, navigate])

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (enabled) {
      timeoutRef.current = setTimeout(() => {
        if (onTimeout) {
          onTimeout()
        } else {
          setShouldRedirect(true)
        }
      }, timeout)
    }
  }, [timeout, onTimeout, enabled])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    const handleActivity = () => {
      resetTimer()
    }

    events.forEach(event => {
      document.addEventListener(event, handleActivity)
    })

    resetTimer()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, resetTimer])
}
