import {z} from "zod/v4";


export const RecordSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id'),
  folderId:z.uuidv7('Please provide a valid uuid for folderId'),
  categoryId:z.uuidv7('Please provide a valid uuid for categoryId'),
  amount:z.float32('Please provide a valid amount')
  .nullable(),
  companyName:z.string('Please provide a valid Company name')
  .trim()
  .max(64,'Please provide a valid name(max 64 characters)')
  .nullable(),
  couponCode:z.string('Please provide a valid coupon code')
  .max(32,'Please provide a valid coupon code (max 32 characters)')
  .trim()
  .nullable(),
  description:z.string('Please provide a valid description')
  .max(512,'Please provide a valid description (max 512 characters)')
  .nullable(),
  expirationDate:z.date('Please provide a valid date')
  .min(new Date('2025-11-04'), {error})

})