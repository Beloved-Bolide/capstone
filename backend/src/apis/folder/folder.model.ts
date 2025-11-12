import { z } from 'zod/v4'
import { sql } from '../../utils/database.utils.ts'


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

/** this type is used to represent a folder object
 * @shape id: string for the primary key for the folder
 * @shape parentFolderId: string for the parent id for the folder
 * @shape userId: string for the userId for the folder
 * @shape name: string for the name for the folder **/
export type Folder = z.infer<typeof FolderSchema>

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
  const { id, parentFolderId, userId, name } = folder

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

/** Selects the Folder from the folder table by id
 * @param id the folder's id to search for in the folder table
 * @returns Folder or null if no folder was found **/
export async function selectFolderByFolderId (id: string): Promise<Folder | null> {

  // create a prepared statement that selects the folder by folder id
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
  return FolderSchema.array().max(1).parse(rowList)[0] ?? null
}

/** Selects all folders by parent folder if
 * @param parentFolderId - the parent folder's ID (can be null for root folders)
 * @returns Array of folders **/
export async function selectFoldersByParentFolderId(parentFolderId: string): Promise<Folder[] | null> {

  // get subfolders of a specific parent
  const rowList = await sql`
    SELECT 
      id,
      parent_folder_id,
      user_id, 
      name
    FROM folder 
    WHERE parent_folder_id = ${parentFolderId}`

  // return the folders or null if no folders were found
  return FolderSchema.array().parse(rowList) ?? null
}

/** select all folders from a user's id
 * @param id the id of the user
 * @returns array of folders **/
export async function selectFoldersByUserId (id: string): Promise<Folder[]> {

  // create a prepared statement that selects the folders by user id
  const rowList = await sql`
    SELECT 
      id,
      parent_folder_id,
      user_id,
      name
    FROM
      folder
    WHERE user_id = ${id}`

  // Enforce that the result is an array of folders
  return FolderSchema.array().parse(rowList)
}

/** selects the folder from the folder table by name
 * @param name the folder's name to search for in the folder table
 * @returns the folder or null if no folder was found **/
export async function selectFolderByFolderName (name: string): Promise<Folder | null> {

  // query the database for the folder with the given name
  const rowList = await sql`
    SELECT 
      id,
      parent_folder_id,
      user_id,
      name
    FROM folder
    WHERE name = ${name}`

  return FolderSchema.array().max(1).parse(rowList)[0] ?? null
}