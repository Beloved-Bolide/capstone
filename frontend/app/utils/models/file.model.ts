import { z } from 'zod/v4'


export const FileSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id.'),
  recordId: z.uuidv7('Please provide a valid uuid for record id.'),
  fileDate: z.coerce.date().nullable(),
  fileKey: z.string('Please provide a valid file key.')
    .trim()
    .min(1, 'Please provide a valid file key. (min 1 characters)')
    .max(32, 'Please provide a valid file key. (max 32 characters)')
    .nullable(),
  fileUrl: z.url('Please provide a valid URL.')
    .trim()
    .min(1, 'Please provide a valid file URL. (min 1 characters)')
    .max(256, 'Please provide a valid file URL. (max 256 characters)'),
  ocrData: z.string('Please provide valid OCR data.')
    .nullable()
})
export type File = z.infer<typeof FileSchema>
export const NewFileSchema = FileSchema.omit({ fileKey: true})
export type NewFile = z.infer<typeof NewFileSchema>