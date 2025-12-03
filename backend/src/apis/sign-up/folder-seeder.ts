import { sql } from '../../utils/database.utils.ts'
import { v7 as uuid } from 'uuid'
import { type Folder, selectFoldersByUserId } from '../folder/folder.model.ts'


export async function seedFolders(userId: string) {

  // seed the root folders
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

  // seed the user folders (top-level folders for organizing records)
  await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${userId}, ${'Receipts'})
  `
  await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${userId}, ${'Warranties'})
  `
  await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${userId}, ${'Manuals'})
  `
  await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${userId}, ${'Coupons'})
  `
}