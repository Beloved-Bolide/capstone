import { z } from 'zod/v4'
import { sql } from '../../utils/database.utils.ts'


/** Schema for validating record objects
 * @shape id: string for the primary key for the record
 * @shape folderId: string for the foreign key for the folder
 * @shape categoryId: string for the foreign key for the category
 * @shape amount: float for the amount for the record
 * @shape companyName: string for the name of the company
 * @shape couponCode: string for the coupon code
 * @shape description: string for the description
 * @shape docType: string for the document type
 * @shape expirationDate: date for the expiration
 * @shape isStarred: boolean for whether the record is starred
 * @shape lastAccessedAt: datetime for the last time it was accessed
 * @shape name: string for the name
 * @shape notifyOn: boolean for the notifications
 * @shape productId: string for the id of the product
 * @shape purchaseDate: date for the day of purchase **/
export const RecordSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id.'),
  folderId: z.uuidv7('Please provide a valid uuid for folderId.'),
  categoryId: z.uuid('Please provide a valid uuid for categoryId.'),
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
  docType: z.string('Please provide a valid document type.')
    .min(1, 'Please provide a valid document type.')
    .max(32, 'Please provide a valid document type (max 32 characters).')
    .nullable(),
  expDate: z.coerce.date('Please provide a valid expiration date.')
    .min(new Date('1900-01-01'), {error: 'Too old!'})
    .nullable(),
  isStarred: z.boolean().default(false),
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

export type Record = z.infer<typeof RecordSchema>

/** Selects the record from the record table by id
 * @param id the record's id to search for in the record table
 * @returns Record or null if no record was found **/
export async function selectRecordByRecordId (id: string): Promise<Record | null> {

  // query the database to select the record by record id
  const rowList = await sql `
    SELECT 
      id,
      folder_id,
      category_id,
      amount,
      company_name,
      coupon_code,
      description,
      doc_type,
      exp_date,
      is_starred,
      last_accessed_at,
      name,
      notify_on,
      product_id,
      purchase_date
    FROM record
    WHERE id = ${id}`

  // enforce that the result is an array with a maximum length of 1
  const result = RecordSchema.array().max(1).parse(rowList)

  // return the first record in the result array, or null
  return result[0] ?? null
}

/** Selects the record from the record table by folderId
 * @param folderId the record to search for in the record table
 * @returns Record array or null if no records were found **/
export async function selectRecordsByFolderId (folderId: string): Promise<Record[] | null> {

  // query the database to select the records by folderId
  const rowList = await sql `
    SELECT
      id,
      folder_id,
      category_id,
      amount,
      company_name,
      coupon_code,
      description,
      doc_type,
      exp_date,
      is_starred,
      last_accessed_at,
      name,
      notify_on,
      product_id,
      purchase_date
    FROM record
    WHERE folder_id = ${folderId}
    AND deleted_at IS NULL`

  // return the result as an array of records, or null if no records were found
  return RecordSchema.array().parse(rowList) ?? null
}

/** Selects all starred records for a user
 * @param userId the user's id to filter records by
 * @returns Record array or null if no starred records were found **/
export async function selectStarredRecordsByUserId (userId: string): Promise<Record[] | null> {

  // query the database to select all starred records for the user
  const rowList = await sql `
    SELECT
      r.id,
      r.folder_id,
      r.category_id,
      r.amount,
      r.company_name,
      r.coupon_code,
      r.description,
      r.doc_type,
      r.exp_date,
      r.is_starred,
      r.last_accessed_at,
      r.name,
      r.notify_on,
      r.product_id,
      r.purchase_date
    FROM record r
    INNER JOIN folder f ON r.folder_id = f.id
    WHERE f.user_id = ${userId}
      AND r.is_starred = true
    ORDER BY r.last_accessed_at DESC`

  // return the result as an array of records, or null if no records were found
  return RecordSchema.array().parse(rowList) ?? null
}

/** Selects records expiring within 2 weeks for a user
 * @param userId the user's id to filter records by
 * @returns Record array or null if no expiring records were found **/
export async function selectExpiringRecordsByUserId (userId: string): Promise<Record[] | null> {

  // Calculate date 2 weeks from now
  const twoWeeksFromNow = new Date()
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14)

  // query the database to select records expiring within 2 weeks
  const rowList = await sql `
    SELECT
      r.id,
      r.folder_id,
      r.category_id,
      r.amount,
      r.company_name,
      r.coupon_code,
      r.description,
      r.doc_type,
      r.exp_date,
      r.is_starred,
      r.last_accessed_at,
      r.name,
      r.notify_on,
      r.product_id,
      r.purchase_date
    FROM record r
    INNER JOIN folder f ON r.folder_id = f.id
    WHERE f.user_id = ${userId}
      AND r.exp_date IS NOT NULL
      AND r.exp_date <= ${twoWeeksFromNow}
    ORDER BY r.exp_date ASC`

  // return the result as an array of records, or null if no records were found
  return RecordSchema.array().parse(rowList) ?? null
}

/** Selects the 12 most recent records by purchase date for a user
 * @param userId the user's id to filter records by
 * @returns Record array or null if no recent records were found **/
export async function selectRecentRecordsByUserId (userId: string): Promise<Record[] | null> {

  // query the database to select the 12 most recent records by purchase date
  const rowList = await sql `
    SELECT
      r.id,
      r.folder_id,
      r.category_id,
      r.amount,
      r.company_name,
      r.coupon_code,
      r.description,
      r.doc_type,
      r.exp_date,
      r.is_starred,
      r.last_accessed_at,
      r.name,
      r.notify_on,
      r.product_id,
      r.purchase_date
    FROM record r
    INNER JOIN folder f ON r.folder_id = f.id
    WHERE f.user_id = ${userId}
      AND r.purchase_date IS NOT NULL
    ORDER BY r.purchase_date DESC
    LIMIT 12`

  // return the result as an array of records, or null if no records were found
  return RecordSchema.array().parse(rowList) ?? null
}

/** Selects the record from the record table by categoryId
 * @param categoryId the record to search for in the record table
 * @returns Record array or null if no records were found **/
export async function selectRecordsByCategoryId (categoryId: string): Promise<Record[] | null> {

  // query the database to select the records by categoryId
  const rowList = await sql `
    SELECT
      id,
      folder_id,
      category_id,
      amount,
      company_name,
      coupon_code,
      description,
      doc_type,
      exp_date,
      is_starred,
      last_accessed_at,
      name,
      notify_on,
      product_id,
      purchase_date
    FROM record
    WHERE category_id = ${categoryId}`

  // return the result as an array of records, or null if no records were found
  const result = RecordSchema.array().safeParse(rowList)
  return result.success ? result.data : null
}

/** Selects the record from the record table by companyName
 * @param companyName the record's company name to search for in the record table
 * @returns Record or null if no record was found **/
export async function selectRecordsByCompanyName (companyName: string): Promise<Record[] | null> {

  // query the database to select the record by companyName
  const rowList = await sql `
    SELECT 
      id,
      folder_id,
      category_id,
      amount,
      company_name,
      coupon_code,
      description,
      doc_type,
      exp_date,
      is_starred,
      last_accessed_at,
      name,
      notify_on,
      product_id,
      purchase_date
    FROM record
    WHERE company_name = ${companyName}`

  // return the result as a single record or null if no record was found
  return RecordSchema.array().parse(rowList) ?? null
}

/** Selects the record from the record table by when it was last accessed
 * @param lastAccessedAt the record's last accessed date to search for in the record table
 * @returns Record array or null if no records were found **/
export async function selectRecordsByLastAccessedAt (lastAccessedAt: Date): Promise<Record[] | null> {

  // query the database to select the records by categoryId
  const rowList = await sql `
    SELECT
      id,
      folder_id,
      category_id,
      amount,
      company_name,
      coupon_code,
      description,
      doc_type,
      exp_date,
      is_starred,
      last_accessed_at,
      name,
      notify_on,
      product_id,
      purchase_date
    FROM record
    WHERE last_accessed_at = ${lastAccessedAt}`

  // return the result as an array of records, or null if no records were found
  return RecordSchema.array().parse(rowList) ?? null
}

/** Selects the record from the record table by name
 * @param name the record's name to search for in the record table
 * @returns Record or null if no record was found **/
export async function selectRecordByName (name: string): Promise<Record | null> {

  // query the database to select the record by name
  const rowList = await sql `
    SELECT 
      id,
      folder_id,
      category_id,
      amount,
      company_name,
      coupon_code,
      description,
      doc_type,
      exp_date,
      is_starred,
      last_accessed_at,
      name,
      notify_on,
      product_id,
      purchase_date
    FROM record
    WHERE name = ${name}`

  // return the result as a single record or null if no record was found
  return RecordSchema.parse(rowList) ?? null
}


/** Search records (case-insensitive partial match)
 * @param searchTerm the search term to look for in records
 * @param userId the user id to filter records by
 * @param limit the maximum number of records to return (default 50)
 * @returns array of records or null if no records were found **/
export async function searchRecords (searchTerm: string, userId: string, limit: number = 50): Promise<Record[] | null> {

  // query the database to select the records by search term filtered by user's folders
  const rowList = await sql `
    SELECT
      r.id,
      r.folder_id,
      r.category_id,
      r.amount,
      r.company_name,
      r.coupon_code,
      r.description,
      r.doc_type,
      r.exp_date,
      r.is_starred,
      r.last_accessed_at,
      r.name,
      r.notify_on,
      r.product_id,
      r.purchase_date
    FROM record r
    INNER JOIN folder f ON r.folder_id = f.id
    WHERE f.user_id = ${userId} AND (
      CAST(r.id AS TEXT)               ILIKE ${`%${searchTerm}%`} OR
      CAST(r.folder_id AS TEXT)        ILIKE ${`%${searchTerm}%`} OR
      CAST(r.category_id AS TEXT)      ILIKE ${`%${searchTerm}%`} OR
      CAST(r.amount AS TEXT)           ILIKE ${`%${searchTerm}%`} OR
      r.company_name                   ILIKE ${`%${searchTerm}%`} OR
      r.coupon_code                    ILIKE ${`%${searchTerm}%`} OR
      r.description                    ILIKE ${`%${searchTerm}%`} OR
      r.doc_type                       ILIKE ${`%${searchTerm}%`} OR
      CAST(r.exp_date AS TEXT)         ILIKE ${`%${searchTerm}%`} OR
      CAST(r.is_starred AS TEXT)       ILIKE ${`%${searchTerm}%`} OR
      CAST(r.last_accessed_at AS TEXT) ILIKE ${`%${searchTerm}%`} OR
      r.name                           ILIKE ${`%${searchTerm}%`} OR
      CAST(r.notify_on AS TEXT)        ILIKE ${`%${searchTerm}%`} OR
      CAST(r.product_id AS TEXT)       ILIKE ${`%${searchTerm}%`} OR
      CAST(r.purchase_date AS TEXT)    ILIKE ${`%${searchTerm}%`}
    )
    ORDER BY r.last_accessed_at DESC
    LIMIT ${limit}`

  // return the result as an array of records, or null if no records were found
  const records = RecordSchema.array().parse(rowList)
  return records.length > 0 ? records : null
}

/** Inserts a new record into the record table
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
    docType,
    expDate,
    isStarred,
    lastAccessedAt,
    name,
    notifyOn,
    productId,
    purchaseDate
  } = record

  // insert the record into the record table
  await sql `
    INSERT INTO record (
      id,
      folder_id,
      category_id,
      amount,
      company_name,
      coupon_code,
      description,
      doc_type,                  
      exp_date,
      is_starred,
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
      ${docType},
      ${expDate},
      ${isStarred},
      ${lastAccessedAt},
      ${name},
      ${notifyOn},
      ${productId},
      ${purchaseDate}
    )`

  return 'Record successfully created!'
}

/** Updates a Record in the Record table
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
    docType,
    expDate,
    isStarred,
    lastAccessedAt,
    name,
    notifyOn,
    productId,
    purchaseDate
  } = record

  // update the record in the record table
  await sql `
    UPDATE record
    SET 
      folder_id        = ${folderId},
      category_id      = ${categoryId},
      amount           = ${amount},
      company_name     = ${companyName},
      coupon_code      = ${couponCode},
      description      = ${description},
      doc_type         = ${docType},     
      exp_date         = ${expDate},
      is_starred       = ${isStarred},
      last_accessed_at = ${lastAccessedAt},
      name             = ${name},
      notify_on        = ${notifyOn},
      product_id       = ${productId},
      purchase_date    = ${purchaseDate}
    WHERE id = ${id}`

  return 'Record successfully updated!'
}

/** Delete a record by its id
 * @param id the id of the record to delete
 * @returns success message **/
export async function deleteRecord(id: string): Promise<string> {

  // delete the record from the database
  await sql `
		DELETE FROM record
		WHERE id = ${id}`

  // return a success message
  return 'Record successfully deleted!'
}