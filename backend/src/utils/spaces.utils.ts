import { S3Client } from '@aws-sdk/client-s3'

// Configure S3 client for DigitalOcean Spaces
export const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION || 'sfo3',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY as string,
    secretAccessKey: process.env.DO_SPACES_SECRET as string
  },
  forcePathStyle: false
})
