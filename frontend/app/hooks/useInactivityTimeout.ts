import { useEffect, useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

interface UseInactivityTimeoutOptions {
  timeout: number // in milliseconds
  onTimeout?: () => void
  enabled?: boolean
}

/**
 * Hook to detect user inactivity and trigger a timeout action
 * Tracks mouse movement, clicks, keyboard input, and touch events
 */
export function useInactivityTimeout({
  timeout,
  onTimeout,
  enabled = true
}: UseInactivityTimeoutOptions) {
  const navigate = useNavigate()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // Handle redirect via useEffect to ensure it happens in React's lifecycle
  useEffect(() => {
    if (shouldRedirect) {
      console.log('🚀 Session timeout - clearing cookies and redirecting')

      // Check what exists BEFORE clearing
      console.log('📋 Cookies BEFORE:', document.cookie)
      console.log('📦 sessionStorage:', Object.keys(sessionStorage))
      console.log('💾 localStorage:', Object.keys(localStorage))

      // CLEAR ALL COOKIES
      console.log('🍪 Clearing all cookies...')
      const cookies = document.cookie.split(';')
      cookies.forEach(cookie => {
        const name = cookie.split('=')[0].trim()
        if (name) {
          console.log(`  Clearing: ${name}`)
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
        }
      })

      // Clear storage
      console.log('🧹 Clearing storage')
      sessionStorage.clear()
      localStorage.clear()

      // Verify
      console.log('📋 Cookies AFTER:', document.cookie)

      // Delay then redirect
      setTimeout(() => {
        console.log('➡️  Redirecting now')
        window.location.href = '/sign-in?timeout=true'
      }, 100)
    }
  }, [shouldRedirect, navigate])

  const resetTimer = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      console.log('🔄 Inactivity timer reset')
    }

    // Set new timeout
    if (enabled) {
      console.log(`⏱️  Starting inactivity timer: ${timeout / 1000} seconds`)
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Inactivity timeout triggered!')
        console.log('onTimeout value:', onTimeout)
        console.log('onTimeout type:', typeof onTimeout)

        if (onTimeout) {
          console.log('📞 Calling custom onTimeout callback')
          onTimeout()
        } else {
          // Default: trigger redirect via state change
          console.log('🔀 Setting shouldRedirect state to true')
          setShouldRedirect(true)
        }
      }, timeout)
    }
  }, [timeout, onTimeout, enabled])

  useEffect(() => {
    console.log(`🔍 useInactivityTimeout hook - enabled: ${enabled}`)

    if (!enabled) {
      console.log('❌ Timeout disabled')
      return
    }

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    // Reset timer on any activity
    const handleActivity = (e: Event) => {
      console.log(`👆 Activity detected: ${e.type}`)
      resetTimer()
    }

    // Add event listeners
    console.log('📝 Adding event listeners for activity tracking')
    events.forEach(event => {
      document.addEventListener(event, handleActivity)
    })

    // Start initial timer
    resetTimer()

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up inactivity timeout')
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, resetTimer])
}
