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

  if (!response.ok) {
    throw new Error('Failed to create new record')
  }

  const headers = response.headers
  const result = await response.json()
  return { headers, result }
}

export async function getRecordById (recordId: string, authorization: string, cookie: string | null): Promise<Record | null> {

  const response = await fetch(`${process.env.REST_API_URL}/record/id/${recordId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: null
  })

  if (!response.ok) {
    throw new Error('Failed to get record')
  }

  const result = await response.json()
  return result.data
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

  if (!response.ok) {
    throw new Error('Failed to get folder')
  }

  const { data } = await response.json()

  return data
}

export async function getStarredRecordsByUserId (userId: string, authorization: string, cookie: string | null): Promise<Record[]> {

  const response = await fetch(`${process.env.REST_API_URL}/record/starred/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: null
  })

  if (!response.ok) {
    throw new Error('Failed to get starred records')
  }

  const { data } = await response.json()

  return data
}

export async function getExpiringRecordsByUserId (userId: string, authorization: string, cookie: string | null): Promise<Record[]> {

  const response = await fetch(`${process.env.REST_API_URL}/record/expiring/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: null
  })

  if (!response.ok) {
    throw new Error('Failed to get expiring records')
  }

  const { data } = await response.json()

  return data
}

export async function getRecentRecordsByUserId (userId: string, authorization: string, cookie: string | null): Promise<Record[]> {

  const response = await fetch(`${process.env.REST_API_URL}/record/recent/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: null
  })

  if (!response.ok) {
    throw new Error('Failed to get recent records')
  }

  const { data } = await response.json()

  return data
}

/**
 * Searches for records based on a query string
 * @param query - The search query string to match against record fields
 * @param authorization - JWT authorization token from session
 * @param cookie - Session cookie for authentication
 * @param limit - Maximum number of results to return (default: 50)
 * @returns Promise that resolves to an array of matching Record objects
 */
export async function searchRecords (query: string, authorization: string, cookie: string | null, limit: number = 50): Promise<Record[]> {

  // Determine the API base URL
  // If running in browser (window exists), construct URL from current location
  // Otherwise use environment variable or localhost fallback for server-side rendering
  const apiBaseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8080/apis`
    : (process.env.REST_API_URL || 'http://localhost:8080/apis')

  // Build the search endpoint URL with encoded query parameter and limit
  const url = `${apiBaseUrl}/record/search?q=${encodeURIComponent(query)}&limit=${limit}`

  // Make GET request to search endpoint
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    credentials: 'include', // Include cookies in cross-origin requests
    body: null
  })

  // If response is not OK (status 200-299), throw an error
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Failed to search records: ${response.status} ${errorData}`)
  }

  // Parse the JSON response
  const responseData = await response.json()

  // Extract the data array from the response
  const { data } = responseData

  // Return the array of matching records
  return data
}

export async function deleteRecord (recordId: string, authorization: string, cookie: string | null): Promise<{ result: Status }> {

  const response = await fetch(`${process.env.REST_API_URL}/record/id/${recordId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: null
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete record')
  }

  return { result }
}

export async function updateRecord (record: Record, authorization: string, cookie: string | null): Promise<{ result: Status }> {

  const response = await fetch(`${process.env.REST_API_URL}/record/id/${record.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: JSON.stringify(record)
  })

  if (!response.ok) {
    throw new Error('Failed to update record')
  }

  const result = await response.json()
  return { result }
}

export async function moveRecordToTrash (record: Record, trashFolderId: string, authorization: string, cookie: string | null): Promise<{ result: Status }> {

  const updatedRecord = {
    id: record.id,
    folderId: trashFolderId,
    categoryId: record.categoryId,
    amount: record.amount,
    companyName: record.companyName,
    couponCode: record.couponCode,
    description: record.description,
    docType: record.docType,
    expDate: record.expDate,
    isStarred: record.isStarred,
    lastAccessedAt: record.lastAccessedAt,
    name: record.name,
    notifyOn: record.notifyOn,
    productId: record.productId,
    purchaseDate: record.purchaseDate
  }

  const response = await fetch(`${process.env.REST_API_URL}/record/id/${record.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: JSON.stringify(updatedRecord)
  })

  if (!response.ok) {
    throw new Error('Failed to move record to trash')
  }

  const result = await response.json()
  return { result }
}

















