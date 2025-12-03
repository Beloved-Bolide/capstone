import { z } from 'zod/v4'
import type { Status } from '~/utils/interfaces/Status'


export const FolderSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id.'),
  parentFolderId: z.uuidv7('Please provide a valid uuid for parent folder id.')
    .nullable(),
  userId: z.uuidv7('Please provide a valid uuid for user id.'),
  name: z.string('Please provide a valid name')
    .trim()
    .min(1, 'Please provide a valid name. (min 1 characters)')
    .max(64, 'Please provide a valid name. (max 64 characters)')
})
export type Folder = z.infer<typeof FolderSchema>

export const NewFolderSchema = FolderSchema.pick({ name: true })
export type NewFolder = z.infer<typeof NewFolderSchema>


export async function postFolder (data: Folder, authorization: string, cookie: string | null): Promise<{ result: Status, headers: Headers }> {

  const response = await fetch(`${process.env.REST_API_URL}/folder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()


  if (!response.ok) {
    throw new Error(result.message || 'Failed to create new folder')
  }

  const headers = response.headers
  return { headers, result }
}

export async function getFolderById (id: string | null, authorization: string, cookie: string | null): Promise<Folder> {

  const response = await fetch(`${process.env.REST_API_URL}/folder/id/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: null
  })

  if (!response.ok) {
    throw new Error('Failed to get folder')
  }

  const folder: Status = await response.json()

  return folder.data
}

/**
 * Fetches a single folder by its name
 * @param name - The name of the folder to retrieve
 * @param authorization - JWT authorization token from session
 * @param cookie - Session cookie for authentication
 * @returns Promise that resolves to the Folder object if found, or null if not found/error
 */
export async function getFolderByName (name: string, authorization: string, cookie: string | null): Promise<Folder | null> {
  try {
    // Make GET request to fetch folder by name
    const response = await fetch(`${process.env.REST_API_URL}/folder/name/${name}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
        'Cookie': cookie ?? ''
      },
      body: null
    })

    // If request fails, return null (folder not found)
    if (!response.ok) {
      return null
    }

    // Parse the JSON response
    const responseData = await response.json()

    // Extract data property from response, handle both direct folder and wrapped response formats
    const folder = responseData.data ?? responseData

    // If no folder data, return null
    if (!folder) {
      return null
    }

    // Validate that the folder has required properties (id and name)
    if (!folder.id || !folder.name) {
      return null
    }

    // Return the folder object
    return folder as Folder
  } catch (error) {
    // If any error occurs, return null
    return null
  }
}

/**
 * Fetches all folders belonging to a specific user
 * @param userId - The ID of the user whose folders to retrieve
 * @param authorization - JWT authorization token from session
 * @param cookie - Session cookie for authentication
 * @returns Promise that resolves to an array of Folder objects
 * @throws Error if the request fails or data format is invalid
 */
export async function getFoldersByUserId (userId: string | null, authorization: string, cookie: string | null): Promise<Folder[]> {

  // Make GET request to fetch all folders for the user
  const response = await fetch(`${process.env.REST_API_URL}/folder/userId/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: null
  })

  // Parse the JSON response
  const result = await response.json()

  // If request failed, throw an error with the server's message
  if (!response.ok) {
    throw new Error(result.message || 'Failed to get folders')
  }

  // Extract the data array from the response
  const { data } = result

  // Validate that data is an array (backend should return array of folders)
  // If not, it indicates a server error or invalid session
  if (!Array.isArray(data)) {
    throw new Error('Invalid folder data received from server. Please sign in again.')
  }

  // Return the array of folders
  return data
}

/**
 * Fetches all child folders of a parent folder
 * @param parentFolderId - The ID of the parent folder (null for root level folders)
 * @param authorization - JWT authorization token from session
 * @param cookie - Session cookie for authentication
 * @returns Promise that resolves to an array of child Folder objects
 * @throws Error if the request fails
 */
export async function getFoldersByParentFolderId(parentFolderId: string | null, authorization: string, cookie: string | null): Promise<Folder[]> {

  // Make GET request to fetch child folders
  const response = await fetch(`${process.env.REST_API_URL}/folder/parentFolderId/${parentFolderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: null
  })

  // Parse the JSON response
  const result = await response.json()

  // If request failed, throw an error
  if (!response.ok) {
    throw new Error(result.message || 'Failed to get folder')
  }

  // Extract the data array from the response
  const { data } = result

  // Validate that data is an array, return empty array if not
  if (!Array.isArray(data)) {
    return []
  }

  // Return the array of child folders
  return data
}

export async function updateFolder (folder: Folder, authorization: string, cookie: string | null): Promise<{ result: Status }> {

  const response = await fetch(`${process.env.REST_API_URL}/folder/id/${folder.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: JSON.stringify({
      name: folder.name,
      parentFolderId: folder.parentFolderId
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to update folder: ${response.status} ${errorText}`)
  }

  const result = await response.json()
  return { result }
}

export async function deleteFolder (folderId: string, authorization: string, cookie: string | null): Promise<{ result: Status }> {

  const response = await fetch(`${process.env.REST_API_URL}/folder/id/${folderId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: null
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete folder')
  }

  return { result }
}

/**
 * Moves a folder to the Trash folder by updating its parent folder ID
 * @param folder - The folder object to move to trash
 * @param trashFolderId - The ID of the Trash folder
 * @param authorization - JWT authorization token from session
 * @param cookie - Session cookie for authentication
 * @returns Promise that resolves to an object containing the result status
 * @throws Error if the move operation fails
 */
export async function moveFolderToTrash (folder: Folder, trashFolderId: string, authorization: string, cookie: string | null): Promise<{ result: Status }> {

  // Make PUT request to update the folder's parent to the Trash folder
  const response = await fetch(`${process.env.REST_API_URL}/folder/id/${folder.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: JSON.stringify({
      name: folder.name,
      parentFolderId: trashFolderId // Move to trash by changing parent
    })
  })

  // If request failed, throw an error with details
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to move folder to trash: ${response.status} ${errorText}`)
  }

  // Parse and return the result
  const result = await response.json()
  return { result }
}