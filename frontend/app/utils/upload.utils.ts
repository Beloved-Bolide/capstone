import type { Status } from '~/utils/interfaces/Status'

export interface UploadResponse {
  fileUrl: string
  key: string
}

/**
 * Uploads a file to DigitalOcean Spaces
 * @param file - The file to upload
 * @param authorization - JWT authorization token from session
 * @param cookie - Session cookie for authentication
 * @returns Promise with the file URL and key from DigitalOcean Spaces
 */
export async function uploadFileToSpaces (
  file: File,
  authorization: string,
  cookie: string | null
): Promise<{ result: Status & { data: UploadResponse } }> {

  // Create FormData to send the file
  const formData = new FormData()
  formData.append('file', file)

  // Upload to the backend upload endpoint
  const response = await fetch(`${process.env.REST_API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: formData
  })

  if (!response.ok) {
    throw new Error('Failed to upload file to DigitalOcean Spaces')
  }

  const result = await response.json()
  return { result }
}
