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

  if (!response.ok) {
    throw new Error('Failed to create new folder')
  }

  const headers = response.headers
  const result = await response.json()
  return { headers, result }
}

export async function getFolderById (id: string | null, authorization: string, cookie: string | null): Promise<Folder | null> {

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

  const folder: Folder = await response.json()

  return folder ?? null
}

export async function getFolderByName (name: string, authorization: string, cookie: string | null): Promise<Folder | null> {

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
    throw new Error('Failed to get folder')
  }

  const folder: Folder = await response.json()

  return folder ?? null
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

  if (!response.ok) {
    throw new Error('Failed to get folder')
  }

  const { data } = await response.json()

  return data
}