import { type Request, type Response } from 'express'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from '../../utils/spaces.utils.ts'
import { serverErrorResponse } from '../../utils/response.utils.ts'
import { v7 as uuid } from 'uuid'

/** Express controller for uploading a file to DigitalOcean Spaces
 * @endpoint POST /apis/upload **/
export async function postUploadController (request: Request, response: Response): Promise<void> {
  try {
    // Check if a file was uploaded
    if (!request.file) {
      response.json({
        status: 400,
        data: null,
        message: 'No file uploaded'
      })
      return
    }

    // Generate unique filename
    const fileExtension = request.file.originalname.split('.').pop()
    const fileName = `${uuid()}.${fileExtension}`
    const key = `filewise-documents/${fileName}`

    // Upload file to DigitalOcean Spaces
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET as string,
      Key: key,
      Body: request.file.buffer,
      ACL: 'public-read',
      ContentType: request.file.mimetype
    })

    await s3Client.send(uploadCommand)

    // Construct the public URL
    const fileUrl = `${process.env.DO_SPACES_CDN_ENDPOINT}/${key}`

    // Return the file URL
    response.json({
      status: 200,
      data: {
        fileUrl: fileUrl,
        key: key
      },
      message: 'File uploaded successfully'
    })

  } catch (error: any) {
    console.error('[postUploadController] Error:', error)
    serverErrorResponse(response, error.message)
  }
}
