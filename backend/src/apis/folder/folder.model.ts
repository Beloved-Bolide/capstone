import {z} from 'zod/v4'
import {sql} from "../../utils/database.utils.ts";

/** schema for validating private folder objects
 * @shape id: string the primary key for the folder
 * @shape parentFolderId: string the primary key for the folder
 * @shape userId: string the primary key for the folder
 * @shape name: string the name for the folder **/
export const PrivateFolderSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id.'),
  parentFolderId: z.uuidv7('Please provide a valid uuid for parent folder id.'),
  userId: z.uuidv7('Please provide a valid uuid for user id.'),
  name: z.string('Please provide a valid uuid for name')
  .trim()
  .min(1, 'Please provide a valid name. (min 1 characters)')
  .max(64, 'Please provide a valid name. (max 64 characters)')
})

/** this type is used to represent a private folder object
 * @shape id: string the primary key for the folder
 * @shape parentFolderId: string the parent id for the folder
 * @shape userId: string the userId for the folder
 * @shape name: string the name for the folder **/
export type PrivateFolder = z.infer<typeof PrivateFolderSchema>

export async function insertFolder (folder: PrivateFolder): Promise<string> {
  // validate the folder object against the PrivateFolderSchema
  PrivateFolderSchema.parse(folder)
  const { id, parentFolderId, userId, name } = folder
  await sql`
    INSERT INTO folder (
      id,
      parent_folder_id,
      user_id,
      name
    )
    VALUES (
      ${id},
      ${parentFolderId},
      ${userId},
      ${name}  
    )`
  return 'Folder successfully created!'
}

/** updates a folder in the folder table
 * @param folder
 * @returns {Promise<string>} 'Folder successfully updated' **/

export async function updateFolder (folder: PrivateFolder): Promise<string> {
  const { id, parentFolderId, userId, name } = folder
  await sql`
    UPDATE folder
    SET
      parent_folder_id = ${parentFolderId},
      name = ${name}
    WHERE
      id = ${id}`
  return 'Folder successfully updated!'
}

/** Selects the PrivateFolder from the folder table by id
 * @param id the folder's id to search for in the folder table
 * @returns Folder or null if no folder was found **/
export async function selectPrivateFolderByFolderId(id: string): Promise<PrivateFolder | null> {
  // create a prepared statement that selects the profile by email and execute the statement
  const rowList = await sql`
    SELECT 
      id,
      parent_folder_id,
      user_id,
      name
    FROM
      folder
    WHERE
      id = ${id}`
  // enforce that the result is an array of one folder, or null
  const result = PrivateFolderSchema.array().max(1).parse(rowList)
  // return the folder or null if no folder was found
  return result[0] ?? null
}