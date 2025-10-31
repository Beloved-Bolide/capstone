import {z} from 'zod/v4'

/**
* schema for validating private folder objects
 * @shape id: string the primary key for the folder
 * @shape parentFolderId: string the primary key for the folder
 * @shape userId: string the primary key for the folder
 * @shape name: string the name for the folder
* */

export const PrivateFolderSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id.'),
  parentFolderId: z.uuidv7('Please provide a valid uuid for parent folder id.'),
  userId: z.uuidv7('Please provide a valid uuid for user id.'),
  name: z.string('Please provide a valid uuid for name')
  .trim()
  .min(1, 'Please provide a valid name. (min 1 characters)')
  .max(64, 'Please provide a valid name. (max 64 characters)')

})
