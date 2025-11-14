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

export async function getFolder (id: string): Folder | undefined {
  return
}