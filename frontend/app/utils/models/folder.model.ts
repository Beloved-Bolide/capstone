import { z } from 'zod/v4'
import type { Status } from '~/utils/interfaces/Status'
import { ClockAlert, FolderOpen, RotateCw, Star, Trash2 } from 'lucide-react'


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

export async function getFolderByName (name: string, authorization: string, cookie: string | null): Promise<Folder | null> {
  try {
    const response = await fetch(`${process.env.REST_API_URL}/folder/name/${name}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
        'Cookie': cookie ?? ''
      },
      body: null
    })

    if (!response.ok) {
      console.error(`[getFolderByName] HTTP ${response.status} for folder: ${name}`)
      return null
    }

    const responseData = await response.json()
    console.log('[getFolderByName] Response structure:', {
      hasData: 'data' in responseData,
      hasMessage: 'message' in responseData,
      dataType: typeof responseData.data
    })

    // Extract data property, handle both direct folder and wrapped response
    const folder = responseData.data ?? responseData

    if (!folder) {
      console.warn(`[getFolderByName] Folder "${name}" not found`)
      return null
    }

    // Validate it has required folder properties
    if (!folder.id || !folder.name) {
      console.error('[getFolderByName] Invalid folder structure:', folder)
      return null
    }

    return folder as Folder
  } catch (error) {
    console.error('[getFolderByName] Exception:', error)
    return null
  }
}

export async function getFoldersByUserId (userId: string | null, authorization: string, cookie: string | null): Promise<Folder[]> {

  const response = await fetch(`${process.env.REST_API_URL}/folder/userId/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: null
  })

  const result = await response.json()


  if (!response.ok) {
    throw new Error(result.message || 'Failed to get folder')
  }

  return result.data
}

export async function getFoldersByParentFolderId(parentFolderId: string | null, authorization: string, cookie: string | null): Promise<Folder[]> {

  const response = await fetch(`${process.env.REST_API_URL}/folder/parentFolderId/${parentFolderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: null
  })

  const result = await response.json()


  if (!response.ok) {
    throw new Error(result.message || 'Failed to get folder')
  }

  const { data } = await response.json()

  // Add validation
  if (!Array.isArray(data)) {
    console.error('[getFoldersByParentFolderId] Expected array, got:', typeof data)
    return []
  }

  return data
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

  if (!response.ok) {
    throw new Error('Failed to delete folder')
  }

  const result = await response.json()
  return { result }
}

export async function moveFolderToTrash (folder: Folder, trashFolderId: string, authorization: string, cookie: string | null): Promise<{ result: Status }> {
  // Add at start of function
  console.log('[moveFolderToTrash] Moving folder:', {
    folderId: folder.id,
    folderName: folder.name,
    currentParent: folder.parentFolderId,
    targetTrashId: trashFolderId
  })

  const response = await fetch(`${process.env.REST_API_URL}/folder/id/${folder.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: JSON.stringify({
      name: folder.name,
      parentFolderId: trashFolderId
    })
  })

  // After fetch, before return
  console.log('[moveFolderToTrash] Response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[moveFolderToTrash] Failed:', errorText)
    throw new Error(`Failed to move folder to trash: ${response.status} ${errorText}`)
  }

  const result = await response.json()
  return { result }
}