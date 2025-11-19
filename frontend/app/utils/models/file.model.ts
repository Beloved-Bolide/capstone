import { z } from 'zod/v4'
import type {Status} from "~/utils/interfaces/Status";


export const FileSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id.'),
  recordId: z.uuidv7('Please provide a valid uuid for record id.'),
  fileDate: z.coerce.date().nullable(),
  fileUrl: z.url('Please provide a valid URL.')
    .trim()
    .min(1, 'Please provide a valid file URL. (min 1 characters)')
    .max(256, 'Please provide a valid file URL. (max 256 characters)'),
  ocrData: z.string('Please provide valid OCR data.')
    .nullable()
})
export type File = z.infer<typeof FileSchema>
export const NewFileSchema = FileSchema
export type NewFile = z.infer<typeof NewFileSchema>

export async function postFile (data: File, authorization: string, cookie: string | null): Promise<{ result: Status, headers: Headers}> {

  const response = await fetch(`${process.env.REST_API_URL}/file`,{

    method:'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: JSON.stringify(data)
  })

  if(!response.ok){
    throw new Error('Failed to create new file')
  }

  const headers = response.headers
  const result = await response.json()
  return { headers, result}

}
