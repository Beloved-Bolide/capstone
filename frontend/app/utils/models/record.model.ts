import { z } from 'zod/v4'
import type { Status } from '~/utils/interfaces/Status'


export const RecordSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id.'),
  folderId: z.uuidv7('Please provide a valid uuid for folderId.'),
  categoryId: z.uuid('Please provide a valid uuid for categoryId.'),
  amount: z.number('Please provide a valid amount.')
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
  expDate: z.iso.date('Please provide a valid expiration date.')
    // .min(new Date('1900-01-01'), { error: 'Too old!' })
    .nullable(),
  isStarred: z.boolean(),
  lastAccessedAt: z.date('Please provide a valid last accessed at date and time.')
    .min(new Date('1900-01-01'), { error: 'Too old!' })
    .nullable(),
  name: z.string('Please provide a valid name.')
    .trim()
    .max(32, 'Please provide a valid name (max 32 characters).')
    .nullable(),
  notifyOn: z.boolean('Please provide either true or false.'),
  productId: z.string('Please provide a valid productId.')
    .max(32, 'Please provide a valid productId (max 32 characters).')
    .nullable(),
  purchaseDate: z.iso.date('Please provide a valid purchase date.')
    // .min(new Date('1900-01-01'), { error: 'Too old!' })
    .nullable()
})
export type Record = z.infer<typeof RecordSchema>

export const NewRecordSchema = RecordSchema.omit({ lastAccessedAt: true, id: true })
export type NewRecord = z.infer<typeof NewRecordSchema>

export async function postRecord (data: Record, authorization: string, cookie: string | null): Promise<{ result: Status, headers: Headers }> {

  const response = await fetch(`${process.env.REST_API_URL}/record`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()


  if (!response.ok) {
    throw new Error(result.message || 'Failed to create new record')
  }

  const headers = response.headers
  return { headers, result }
}

export async function getRecordsByFolderId (folderId: string | null, authorization: string, cookie: string | null): Promise<Record[]> {

  const response = await fetch(`${process.env.REST_API_URL}/record/folderId/${folderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: null
  })

  const result = await response.json()


  if (!response.ok) {
    throw new Error(result.message || 'Failed to get folder')
  }

  return result.data
}
