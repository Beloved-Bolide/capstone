import { z } from 'zod/v4'
import { sql } from '../../utils/database.utils.ts'


/** Schema for validating file objects
 * @shape id: string for the primary key for the file
 * @shape recordId: string for the foreign key linking to the record
 * @shape fileDate: Date for when the file was created
 * @shape fileKey: string for the file key/identifier
 * @shape fileUrl: string for the URL where the file is stored
 * @shape isStarred: boolean indicating if the file is starred
 * @shape ocrData: string containing OCR extracted text data **/
export const FileSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id.'),
  recordId: z.uuidv7('Please provide a valid uuid for record id.'),
  fileDate: z.coerce.date().nullable(),
  fileKey: z.string('Please provide a valid file key')
    .trim()
    .min(1, 'Please provide a valid file key. (min 1 characters)')
    .max(32, 'Please provide a valid file key. (max 32 characters)')
    .nullable(),
  fileUrl: z.url('Please provide a valid URL.')
    .trim()
    .min(1, 'Please provide a valid file URL. (min 1 characters)')
    .max(256, 'Please provide a valid file URL. (max 256 characters)'),
  ocrData: z.string('Please provide valid OCR data')
    .nullable()
})

export type File = z.infer<typeof FileSchema>

/** Selects the File from the file table by id
 * @param id the file's id to search for in the file table
 * @returns File or null if no file was found **/
export async function selectFileByFileId (id: string): Promise<File | null> {

  // create a prepared statement that selects the file by file id
  const rowList = await sql`
    SELECT
      id,
      record_id,
      file_date,
      file_key,
      file_url,
      ocr_data
    FROM
      file
    WHERE
      id = ${id}`

  // enforce that the result is an array of one file, or null
  return FileSchema.parse(rowList) ?? null
}

/** Select all files from a record's id
 * @param id the id of the record
 * @returns array of files **/
export async function selectFilesByRecordId (id: string): Promise<File[] | null> {

  // create a prepared statement that selects the files by record id
  const rowList = await sql`
    SELECT
      id,
      record_id,
      file_date,
      file_key,
      file_url,
      ocr_data
    FROM
      file
    WHERE
      record_id = ${id}`

  // enforce that the result is an array of files
  return FileSchema.array().parse(rowList) ?? null
}

/** Inserts a new file into the file table
 * @param file the file to insert
 * @returns { Promise<string> } 'File successfully created!' **/
export async function insertFile (file: File): Promise<string> {

  // validate the file object against the FileSchema
  FileSchema.parse(file)

  // extract the file's properties
  const { id, recordId, fileDate, fileKey, fileUrl, ocrData } = file

  // insert the file into the file table
  await sql`
    INSERT INTO file (
      id,
      record_id,
      file_date,
      file_key,
      file_url,
      ocr_data
    )
    VALUES (
      ${id},
      ${recordId},
      ${fileDate},
      ${fileKey},
      ${fileUrl},
      ${ocrData}
    )`

  return 'File successfully created!'
}

/** Updates a file in the file table
 * @param file the file to update
 * @returns { Promise<string> } 'File successfully updated!' **/
export async function updateFile (file: File): Promise<string> {

  // validate the file object against the FileSchema
  const { id, recordId, fileDate, fileKey, fileUrl, ocrData } = file

  // update the file in the file table
  await sql`
    UPDATE file
    SET 
      record_id = ${recordId},
      file_date = ${fileDate},
      file_key  = ${fileKey},
      file_url  = ${fileUrl},
      ocr_data  = ${ocrData}
    WHERE
      id = ${id}`

  return 'File successfully updated!'
}

/** Deletes a file from the file table
 * @param id the file id to delete
 * @returns { Promise<string> } 'File successfully deleted!' **/
export async function deleteFile (id: string): Promise<string> {

  // delete the file from the file table
  await sql`
    DELETE FROM file
    WHERE id = ${id}`

  return 'File successfully deleted!'
}