import type { Request, Response } from 'express'
import { UploadUrlRequestSchema } from './upload-url.validator.ts'
import { v7 as uuidv7 } from 'uuid'


export async function postUploadUrlController(request: Request, response: Response): Promise<void> {

  if (!request.session.user) {
    response.status(401).json({
      status: 401,
      message: 'Please sign in.',
      data: null
    })
  }

  const validatedRequest = UploadUrlRequestSchema.safeParse(request.body)
  if (!validatedRequest.success) {
    response.status(400).json({
      status: 400,
      message: validatedRequest.error.errors[0]?.message || 'Invalid request data',
      data: null
    })
  }

  const { fileType, fileSize } = validatedRequest.data

  const extension = fileType.split('/')[1]
  const baseFileName = `${uuidv7()}-${Date.now()}.${extension}`

  const folder = 'All Folders'
  const fileName = `${folder}/${baseFileName}`

  try {

    const command = new PutObjectCommand({
      Record:
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