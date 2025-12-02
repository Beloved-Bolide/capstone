/** Upload URL Request Validation
 *
 * Validates file upload requests to ensure:
 * - Only allowed image types are uploaded (JPEG, PNG, GIF, WebP)
 * - File sizes don't exceed the maximum limit (5MB)
 * This validatedRequest happens BEFORE generating pre-signed URLs to prevent
 * wasting resources on invalid upload attempts.
 * @module upload-url.validator **/

import { z } from 'zod'


/** Maximum allowed file size in bytes
 *
 * Set to 5MB (5 * 1024 * 1024 bytes) to balance:
 * - Upload speed: Reasonable even on slower connections
 * - Image quality: Sufficient for high-quality photos
 * - Storage costs: Prevents excessive storage usage
 * - Performance: Keeps page load times reasonable
 * Users should compress/resize images before uploading if they exceed this limit. **/
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

/** Maximum allowed file size in bytes
 *
 * Set to 5MB (5 * 1024 * 1024 bytes) to balance:
 * - Upload speed: Reasonable even on slower connections
 * - Image quality: Sufficient for high-quality photos
 * - Storage costs: Prevents excessive storage usage
 * - Performance: Keeps page load times reasonable
 * Users should compress/resize images before uploading if they exceed this limit. **/
const MAX_FILE_SIZE = 5 * 1024 * 1024

/** Zod schema for validating upload URL requests
 *
 * Validates the request body when requesting a pre-signed upload URL.
 * Both fileType and fileSize are validated before generating the URL.
 * @property { string } fileType - MIME type (must be JPEG, PNG, GIF, or WebP)
 * @property { number } fileSize - Size in bytes (must be > 0 and <= 5MB) **/
export const UploadUrlRequestSchema = z.object({
  // @ts-ignore
  fileType: z.enum(ALLOWED_MIME_TYPES, {
    errorMap: () => ({ message: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' }),
  }),
  fileSize: z.number()
  .positive('File size must be greater than 0')
  .max(MAX_FILE_SIZE, 'File size exceeds 5MB limit'),
})

/** TypeScript type for validated upload URL requests
 *
 * Uses this type when working with validated request data in controllers.
 * @typeof { Object } UploadUrlRequest
 * @property { 'image/jpeg'|'image/png'|'image/gif'|'image/webp' } fileType - MIME type
 * @property { number } fileSize - File size in bytes (1 to 5,242,880) **/
export type UploadUrlRequest = z.infer<typeof UploadUrlRequestSchema>