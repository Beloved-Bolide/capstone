/** Upload Model
 * Handles requesting pre-signed URLs for image uploads **/
import type { Status } from '~/utils/interfaces/Status'
import * as process from 'node:process'

/** Gets a pre-signed URL for uploading an image
 *
 * @param fileType - MIME type (e.g., 'image/jpeg')
 * @param fileSize - Size in bytes
 * @param authorization - JWT token
 * @param cookie - Optional cookie for SSR
 * @returns Promise with upload URL data **/
export async function getUploadUrl(
fileType: string,
fileSize: number,
authorization: string,
cookie?: string | null
): Promise<Status> {
  const headers: HeadersInit = {
    'Authorization': authorization,
    'Content-Type': 'application/json'
  }

  if (cookie) {
    headers['Cookie'] = cookie
  }

  const response = await fetch(`${process.env.REST_API_URL}/upload-url`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ fileType, fileSize })
  })

  if (!response.ok) {
    const errorResult: Status = await response.json()
    return errorResult
  }

  const result: Status = await response.json()
  return result
}