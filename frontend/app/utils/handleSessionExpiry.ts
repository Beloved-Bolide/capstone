import { redirect } from 'react-router'

/**
 * Helper function to check if a response indicates session expiry (401)
 * and throw a redirect if so. Use in loaders/actions.
 */
export async function checkSessionExpiry(response: Response): Promise<void> {
  if (response.status === 401) {
    throw redirect('/sign-in?timeout=true')
  }
}

/**
 * Parse response and check for 401 in JSON body
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json()
  
  if (data.status === 401) {
    throw redirect('/sign-in?timeout=true')
  }
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }
  
  return data
}
