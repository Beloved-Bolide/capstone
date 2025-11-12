import { z } from 'zod/v4'
import { sql } from '../../utils/database.utils.ts'


/** schema for validating record objects
 * @shape id: string for the primary key for the record
 * @shape folderId: string for the foreign key for the folder
 * @shape categoryId: string for the foreign key for the category
 * @shape amount: float for the amount for the record
 * @shape companyName: string for the name of the company
 * @shape couponCode: string for the coupon code
 * @shape description: string for the description
 * @shape expirationDate: date for the expiration
 * @shape lastAccessedAt: datetime for the last time it was accessed
 * @shape name: string for the name
 * @shape notifyOn: boolean for the notifications
 * @shape productId: string for the id of the product
 * @shape purchaseDate: date for the day of purchase **/
export const RecordSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id.'),
  folderId: z.uuidv7('Please provide a valid uuid for folderId.'),
  categoryId: z.uuidv7('Please provide a valid uuid for categoryId.'),
  amount: z.coerce.number('Please provide a valid amount.')
    .nullable(),
  companyName: z.string('Please provide a valid company name.')
    .trim()
    .max(64, 'Please provide a valid name (max 64 characters).')
    .nullable(),
  couponCode: z.string('Please provide a valid coupon code.')
    .max(32, 'Please provide a valid coupon code (max 32 characters).')
    .trim()
    .nullable(),
  description: z.string('Please provide a valid description.')
    .max(512, 'Please provide a valid description (max 512 characters).')
    .nullable(),
  expDate: z.coerce.date('Please provide a valid expiration date.')
    .min(new Date('1900-01-01'), {error: 'Too old!'})
    .nullable(),
  lastAccessedAt: z.coerce.date('Please provide a valid last accessed at date and time.')
    .min(new Date('1900-01-01'), {error: 'Too old!'})
    .nullable(),
  name: z.string('Please provide a valid name.')
    .trim()
    .max(32, 'Please provide a valid name (max 32 characters).')
    .nullable(),
  notifyOn: z.boolean('Please provide either true or false.')
    .nullable(),
  productId: z.string('Please provide a valid productId.')
    .max(32, 'Please provide a valid productId (max 32 characters).')
    .nullable(),
  purchaseDate: z.coerce.date('Please provide a valid purchase date.')
    .min(new Date('1900-01-01'), {error: 'Too old!'})
    .nullable()
})

/** record type inferred from Schema **/
export type Record = z.infer<typeof RecordSchema>

/** inserts a new record into the record table
 * @param record the record to insert
 * @returns { Promise<string> } 'Record successfully created!' **/
export async function insertRecord (record: Record): Promise<string> {

  // validate the record object against the record schema
  RecordSchema.parse(record)

  // extract the record's properties
  const {
    id,
    folderId,
    categoryId,
    amount,
    companyName,
    couponCode,
    description,
    expDate,
    lastAccessedAt,
    name,
    notifyOn,
    productId,
    purchaseDate
  } = record

  // insert the record into the record table
  await sql`
    INSERT INTO record (
      id,
      folder_id,
      category_id,
      amount,
      company_name,
      coupon_code,
      description,
      exp_date,
      last_accessed_at,
      name,
      notify_on,
      product_id,
      purchase_date
    )
    VALUES (
      ${id},
      ${folderId},
      ${categoryId},
      ${amount},
      ${companyName},
      ${couponCode},
      ${description},
      ${expDate},
      ${lastAccessedAt},
      ${name},
      ${notifyOn},
      ${productId},
      ${purchaseDate}
    )`
  return 'Record successfully created!'
}

/** updates a Record in the Record table
 * @param record the record to update
 * @returns 'Record successfully updated!' **/
export async function updateRecord (record: Record): Promise<string> {

  // validate the record object against the record schema
  const {
    id,
    folderId,
    categoryId,
    amount,
    companyName,
    couponCode,
    description,
    expDate,
    lastAccessedAt,
    name,
    notifyOn,
    productId,
    purchaseDate
  } = record

  // update the record in the record table
  await sql`
    UPDATE record
    SET 
      folder_id        = ${folderId},
      category_id      = ${categoryId},
      amount           = ${amount},
      company_name     = ${companyName},
      coupon_code      = ${couponCode},
      description      = ${description},
      exp_date         = ${expDate},
      last_accessed_at = ${lastAccessedAt},
      name             = ${name},
      notify_on        = ${notifyOn},
      product_id       = ${productId},
      purchase_date    = ${purchaseDate}
    WHERE id = ${id}`

  return 'Folder successfully updated!'
}

/** Selects the record from the record table by id
 * @param id the record's id to search for in the record table
 * @returns Record or null if no folder was found **/
export async function selectRecordByRecordId (id: string): Promise<Record | null> {

  // create a prepared statement that selects the record by record id
  const rowList = await sql`
    SELECT 
      id,
      folder_id,
      category_id,
      amount,
      company_name,
      coupon_code,
      description,
      exp_date,
      last_accessed_at,
      name,
      notify_on,
      product_id,
      purchase_date
    FROM record
    WHERE id = ${id}`

  // return the result as a single record or null if no record was found
  return RecordSchema.array().max(1).parse(rowList)[0] ?? null
}

/** Selects the record from the record table by folderId
 * @param folderId the record to search for in the record table
 * @returns Record array or null if no records were found **/
export async function selectRecordsByFolderId (folderId: string): Promise<Record[] | null> {

  // query the database to select the records by folderId
  const rowList = await sql`
    SELECT 
      id,
      folder_id,
      category_id,
      amount,
      company_name,
      coupon_code,
      description,
      exp_date,
      last_accessed_at,
      name,
      notify_on,
      product_id,
      purchase_date
    FROM record
    WHERE folder_id = ${folderId}`

  // return the result as an array of records, or null if no records were found
  return RecordSchema.array().parse(rowList) ?? null
}

/** Selects the record from the record table by categoryId
 * @param categoryId the record to search for in the record table
 * @returns Record array or null if no records were found **/
export async function selectRecordsByCategoryId (categoryId: string): Promise<Record[] | null> {

  // query the database to select the records by categoryId
  const rowList = await sql`
    SELECT
      id,
      folder_id,
      category_id,
      amount,
      company_name,
      coupon_code,
      description,
      exp_date,
      last_accessed_at,
      name,
      notify_on,
      product_id,
      purchase_date
    FROM record
    WHERE
      category_id = ${categoryId}`

  // return the result as an array of records, or null if no records were found
  return RecordSchema.array().parse(rowList) ?? null
}

// export async function selectRecordsByCompanyName (companyName: string): Promise<Record[] | null> {
//
//
// }