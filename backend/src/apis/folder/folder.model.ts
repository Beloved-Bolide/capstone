import { z } from 'zod/v4'
import { sql } from '../../utils/database.utils.ts'
import { selectRecordsByFolderId } from '../record/record.model.ts'


/** schema for validating folder objects
 * @shape id: string for the primary key for the folder
 * @shape parentFolderId: string for the primary key for the folder
 * @shape userId: string for the primary key for the folder
 * @shape name: string for the name for the folder **/
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

/** Selects the Folder from the folder table by id
 * @param id the folder's id to search for in the folder table
 * @returns Folder or null if no folder was found **/
export async function selectFolderByFolderId (id: string): Promise<Folder | null> {

  // create a prepared statement that selects the folder by folder id
  const rowList = await sql `
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
  const result = FolderSchema.array().max(1).parse(rowList)
  // return the first folder found, or null if no folder was found
  return result[0] ?? null
}

/** Selects all folders by parent folder if
 * @param parentFolderId - the parent folder's ID (can be null for root folders)
 * @param userId - the user's ID to filter by (prevents cross-user data leakage)
 * @returns Array of folders **/
export async function selectFoldersByParentFolderId(parentFolderId: string, userId: string): Promise<Folder[] | null> {

  // get subfolders of a specific parent, filtered by user for security
  const rowList = await sql `
    SELECT
      id,
      parent_folder_id,
      user_id,
      name
    FROM folder
    WHERE parent_folder_id = ${parentFolderId}
    AND user_id = ${userId}
    AND deleted_at IS NULL`

  // return the folders or null if no folders were found
  const result = FolderSchema.array().parse(rowList)
  return result ?? null
}

/** select all folders from a user's id
 * @param id the id of the user
 * @returns array of folders **/
export async function selectFoldersByUserId (id: string): Promise<Folder[] | null> {

  // create a prepared statement that selects the folders by user id
  const rowList = await sql `
    SELECT 
      id,
      parent_folder_id,
      user_id,
      name
    FROM
      folder
    WHERE user_id = ${id}`

  // return the folders or null if no folders were found
  const result = FolderSchema.array().parse(rowList)
  return result ?? null
}

/** selects the folder from the folder table by name
 * @param name the folder's name to search for in the folder table
 * @param userId
 * @returns the folder or null if no folder was found **/
export async function selectFolderByFolderName (name: string, userId: string): Promise<Folder | null> {

  // query the database for the folder with the given name
  const rowList = await sql `
    SELECT 
      id,
      parent_folder_id,
      user_id,
      name
    FROM folder
    WHERE name = ${name} AND user_id = ${userId}`

  // enforce that the result is an array of one folder, or null
  const result = FolderSchema.array().max(1).parse(rowList)
  // return the first folder found, or null if no folder was found
  return result[0] ?? null
}

/** inserts a new folder into the folder table
 * @param folder the folder to insert
 * @returns { Promise<string> } 'Folder successfully created!' **/
export async function insertFolder (folder: Folder): Promise<string> {

  // validate the folder object against the FolderSchema
  FolderSchema.parse(folder)

  // extract the folder's properties
  const { id, parentFolderId, userId, name } = folder

  // insert the folder into the folder table
  await sql `
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
 * @param folder the folder to update
 * @returns { Promise<string> } 'Folder successfully updated!' **/
export async function updateFolder (folder: Folder): Promise<string> {

  // validate the folder object against the FolderSchema
  const { id, parentFolderId, name } = folder

  // update the folder in the folder table
  await sql `
    UPDATE folder
    SET
      parent_folder_id = ${parentFolderId},
      name = ${name}
    WHERE
      id = ${id}`

  return 'Folder successfully updated!'
}

/** Checks if a folder is a descendant of another folder
 * @param potentialDescendantId the potential descendant's id
 * @param ancestorId the ancestor's id
 * @returns { Promise<boolean> } true if the potential descendant is a descendant of the ancestor, false otherwise **/
export async function isDescendant(potentialDescendantId: string, ancestorId: string): Promise<boolean> {

  // base case: if the potential descendant is the ancestor, return true
  let currentId = potentialDescendantId

  // recursive case: check if the current folder is the ancestor
  while (currentId) {
    const folder = await selectFolderByFolderId(currentId)
    if (!folder || !folder.parentFolderId) return false
    if (folder.parentFolderId === ancestorId) return true
    currentId = folder.parentFolderId
  }

  // if we reach the root folder without finding the ancestor, return false
  return false
}

/** Checks if a folder has any child folders
 * @param id the folder's id to check for child folders
 * @param userId the user's id to filter by (prevents cross-user data leakage)
 * @returns { Promise<boolean> } true if the folder has child folders, false otherwise **/
export async function hasChildFolders (id: string, userId: string): Promise<boolean> {

  // get the child folders of the given folder, filtered by user
  const childFolders = await selectFoldersByParentFolderId(id, userId)

  // return true if there are child folders, false otherwise
  return childFolders ? childFolders.length > 0 : false
}

/** Checks if a folder has any records
 * @param id the folder's id to check for records
 * @returns { Promise<boolean> } true if the folder has records, false otherwise **/
export async function hasRecords (id: string): Promise<boolean> {

  // get the parent folders of the given folder
  const records = await selectRecordsByFolderId(id)

  // return true if there are records, false otherwise
  return records ? records.length > 0 : false
}

/** Deletes a folder from the folder table
 * @param id the folder's id to delete
 * @returns { Promise<string> } 'Folder successfully deleted!' **/
export async function deleteFolder (id: string): Promise<string> {

  // delete the folder from the database
  await sql `
    DELETE FROM folder
    WHERE id = ${id}`

  // return a success message
  return 'Folder successfully deleted!'
}

/** Recursively deletes a folder and all its contents (subfolders and records)
 * @param id the folder's id to delete
 * @param userId the user's id (for security filtering)
 * @returns { Promise<{ foldersDeleted: number, recordsDeleted: number }> } counts of deleted items **/
export async function deleteFolderRecursive (id: string, userId: string): Promise<{ foldersDeleted: number, recordsDeleted: number }> {
  let foldersDeleted = 0
  let recordsDeleted = 0

  // Import deleteRecord to avoid circular dependency issues
  const { selectRecordsByFolderId, deleteRecord } = await import('../record/record.model.ts')

  // 1. Get all child folders (filtered by user for security)
  const childFolders = await selectFoldersByParentFolderId(id, userId)

  // 2. Recursively delete all child folders
  if (childFolders && childFolders.length > 0) {
    for (const childFolder of childFolders) {
      const childResult = await deleteFolderRecursive(childFolder.id, userId)
      foldersDeleted += childResult.foldersDeleted
      recordsDeleted += childResult.recordsDeleted
    }
  }

  // 3. Get all records in this folder
  const records = await selectRecordsByFolderId(id)

  // 4. Delete all records in this folder
  if (records && records.length > 0) {
    for (const record of records) {
      await deleteRecord(record.id)
      recordsDeleted++
    }
  }

  // 5. Finally delete the folder itself
  await deleteFolder(id)
  foldersDeleted++

  return { foldersDeleted, recordsDeleted }
}