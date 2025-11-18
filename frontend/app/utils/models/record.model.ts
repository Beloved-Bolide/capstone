import { z } from 'zod/v4'


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
export type Record = z.infer<typeof RecordSchema>
export const NewRecordSchema = RecordSchema.omit({ id: true })
export type NewRecord = z.infer<typeof NewRecordSchema>