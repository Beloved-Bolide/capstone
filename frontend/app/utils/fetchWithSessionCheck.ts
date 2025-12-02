import { redirect } from 'react-router'

/**
 * Wrapper for fetch that automatically handles session expiry (401)
 * Use this in server-side loaders/actions
 */
export async function fetchWithSessionCheck(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, options)
  const data = await response.json()

  // Check if session expired
  if (data.status === 401) {
    throw redirect('/sign-in?timeout=true')
  }

  // Return a new Response with the data we already parsed
  return new Response(JSON.stringify(data), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  })
}
