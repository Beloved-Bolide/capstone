import { S3Client } from '@aws-sdk/client-s3'


const region = process.env.DO_SPACES_REGION || 'sf03'

export const BUCKET_NAME = process.env.DO_SPACES_BUCKET_NAME as string

let endpoint = process.env.DO_SPACES_ENDPOINT || `https://${region}.digitaloceanspaces.com`

if (BUCKET_NAME && endpoint.includes(BUCKET_NAME)) {
  endpoint = endpoint.replace(`${BUCKET_NAME}.`, '')
}

export const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY as string,
    secretAccessKey: process.env.DO_SPACES_SECRET as string
  },
  forcePathStyle: false
})