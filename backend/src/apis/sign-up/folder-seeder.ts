import { sql } from '../../utils/database.utils.ts'
import { v7 as uuid } from 'uuid'
import { type Folder, selectFoldersByUserId } from '../folder/folder.model.ts'


export async function seedFolders(userId: string) {

  // seed the root folders
  await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${userId}, ${'All Folders'})
  `
  await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${userId}, ${'Starred'})
  `
  await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${userId}, ${'Recent'})
  `
  await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${userId}, ${'Expiring'})
  `
  await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${userId}, ${'Trash'})
  `

  // get all the folders that the user owns
  const folders: Folder[] | null = await selectFoldersByUserId(userId)
  if (!folders) return

  // get the parent folder id for the new folders
  let parentFolderId: string | undefined | null = folders[0]?.id
  if (parentFolderId === undefined) parentFolderId = null

  // seed the child folders
  await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${parentFolderId}, ${userId}, ${'Receipts'})
  `
  await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${parentFolderId}, ${userId}, ${'Warranties'})
  `
  await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${parentFolderId}, ${userId}, ${'Manuals'})
  `
  await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${parentFolderId}, ${userId}, ${'Coupons'})
  `
}