import type { Request, Response } from 'express'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v7 as uuidv7 } from 'uuid'
import { s3Client, BUCKET_NAME } from '../../utils/s3-client.js'
import { UploadUrlRequestSchema } from './upload-url.validator.js'


export async function postUploadUrlController(request: Request, response: Response): Promise<void> {

  const validatedRequest = UploadUrlRequestSchema.safeParse(request.body)
  if (!validatedRequest.success) {
    response.status(400).json({
      status: 400,
      message: validatedRequest.error.message,
      data: null
    })
    return
  }

  const { fileType, fileSize } = validatedRequest.data
  if (!fileType || !fileSize) {
    response.status(400).json({
      status: 400,
      message: 'Invalid fileType or fileSize',
      data: null
    })
    return
  }

  const extension = fileType.split('/')[1]
  const baseFileName = `${uuidv7()}-${Date.now()}.${extension}`

  const folder = 'All Folders'
  const fileName = `${folder}/${baseFileName}`

  try {

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
      ACL: 'public-read'
    })

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300
    })

    const region = process.env.DO_SPACES_REGION || 'sf03'

    const publicUrl = process.env.DO_SPACES_CDN_ENDPOINT
    ? `${process.env.DO_SPACES_CDN_ENDPOINT}/${fileName}`
    : `https://${BUCKET_NAME}.${region}.digitaloceanspaces.com/${fileName}`

    response.status(200).json({
      status: 200,
      message: 'Upload URL generated successfully',
      data: {
        uploadUrl,
        publicUrl,
        expiresIn: 300
      }
    })

  } catch (error) {
    console.error('Error generating upload URL:', error)
    response.status(500).json({
      status: 500,
      message: 'Failed to generate upload URL',
      data: null
    })
  }
}