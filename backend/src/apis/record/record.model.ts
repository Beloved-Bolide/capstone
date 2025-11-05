import { z } from 'zod/v4'


/**
 * Schema for validating record objects
 * @shape id: string the primary key for the record
 * @shape folderId: string the foreign key for the folder
 * @shape categoryId: string the foreign key for the category
 * @shape amount: float the amount for the record
 * @shape companyName: string for the name of the company
 * @shape couponCode: string for the coupon code
 * @shape description: string for the description
 * @shape expirationDate: date for the expiration
 * @shape lastAccessedAt: datetime for the last time it was accessed
 * @shape name: string for the name
 * @shape notifyOn: boolean for the notifications
 * @shape productId: string for the id of the product
 * @shape purchaseDate: date for the day of purchase
 * @shape warrantyExpiration : date for the warranty expiration
 */
export const RecordSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id'),
  folderId: z.uuidv7('Please provide a valid uuid for folderId'),
  categoryId: z.uuidv7('Please provide a valid uuid for categoryId'),
  amount: z.float32('Please provide a valid amount')
    .nullable(),
  companyName: z.string('Please provide a valid Company name')
    .trim()
    .max(64,'Please provide a valid name(max 64 characters)')
    .nullable(),
  couponCode: z.string('Please provide a valid coupon code')
    .max(32,'Please provide a valid coupon code (max 32 characters)')
    .trim()
    .nullable(),
  description: z.string('Please provide a valid description')
    .max(512,'Please provide a valid description (max 512 characters)')
    .nullable(),
  expirationDate: z.date('Please provide a valid date')
    .min(new Date('1900-01-01'), { error: 'Too old!' })
    .nullable(),
  lastAccessedAt: z.iso.datetime('Please provide a valid datetime'),
  name: z.string('Please provide a valid name')
    .trim()
    .max(32,'Please provide a valid name (max 32 characters)')
    .nullable(),
  notifyOn: z.boolean('Please provide either true or false')
    .nullable(),
  productId: z.string('Please provide a valid productId')
    .max(32,'Please provide a valid productId (max 32 characters)')
    .nullable(),
  purchaseDate: z.date('Please provide a valid date')
    .min(new Date('1900-01-01'), { error: 'Too old!' })
    .nullable(),
  warrantyExpiration: z.date('Please provide a valid date')
    .min(new Date('1900-01-01'), { error: 'Too old!' })
    .nullable()
})

