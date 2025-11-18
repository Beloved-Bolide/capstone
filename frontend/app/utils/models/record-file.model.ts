import { z } from 'zod/v4/index'


export const RecordFileModel = z.object({
  folderId: z.uuidv7('Please provide a valid uuid for folderId.'),
  recordId: z.uuidv7('Please provide a valid uuid for record id.'),
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
  ocrData: z.string('Please provide valid OCR data.')
    .nullable(),
  productId: z.string('Please provide a valid productId.')
    .max(32, 'Please provide a valid productId (max 32 characters).')
    .nullable(),
  purchaseDate: z.coerce.date('Please provide a valid purchase date.')
    .min(new Date('1900-01-01'), {error: 'Too old!'})
    .nullable()
})
export type RecordFile = z.infer<typeof RecordFileModel>
export const NewRecordFileSchema = RecordFileModel.omit({ isStarred: true, lastAccessedAt: true, notifyOn: true })
export type NewRecordFile = z.infer<typeof NewRecordFileSchema>