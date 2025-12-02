export async function fetchWithSession(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include' // Always include session cookie
  })

  // If session expired (401 Unauthorized), redirect to sign-in
  if (response.status === 401) {
    window.location.href = '/sign-in'
    return null
  }

  return response
}