import { type Request, type Response } from 'express'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import { validateSessionUser } from '../../utils/auth.utils.ts'
import { selectRecordByRecordId } from '../record/record.model.ts'
import { selectFolderByFolderId } from '../folder/folder.model.ts'
import {
  type File,
  FileSchema,
  insertFile,
  updateFile,
  selectFileByFileId,
  selectFilesByRecordId
} from './file.model.ts'


/** Express controller for creating a new file
 * @endpoint POST /apis/file **/
export async function postFileController (request: Request, response: Response): Promise<void> {
  try {

    // parse the new file data from the request body and validate it
    const validationResult = FileSchema.safeParse(request.body)
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // get the record id from the validated request body
    const { recordId } = validationResult.data
    const record = await selectRecordByRecordId(recordId)

    // get the folder id from the validated request body and check if it exists
    const folderId = record?.folderId
    if (!folderId) {
      response.json({
        status: 404,
        data: null,
        message: 'Unable to post file.'
      })
      return
    }

    // get the folder owner and check if the user making the request is the owner of the folder
    const folder = await selectFolderByFolderId(folderId)
    const userId = folder?.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // insert the new file data into the database
    const insertedFile = await insertFile(validationResult.data)

    // return the inserted file's attributes and a 200 response
    response.json({
      status: 200,
      data: insertedFile,
      message: 'New file successfully created!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for updating a file
 * @endpoint PUT /apis/file/id/:id **/
export async function updateFileController (request: Request, response: Response): Promise<void> {
  try {

    // parse the file id from the request parameters and validate it
    const validatedRequestParams = FileSchema.pick({ id: true }).safeParse({ id: request.params.id })
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // parse the updated file data from the request body and validate it
    const validatedRequestBody = FileSchema.safeParse(request.body)
    if (!validatedRequestBody.success) {
      zodErrorResponse(response, validatedRequestBody.error)
      return
    }

    // get the file id from the validated request parameters and check if it exists
    const { id } = validatedRequestParams.data
    const file: File | null = await selectFileByFileId(id)
    if (!file) {
      response.json({
        status: 404,
        data: null,
        message: 'File not found.'
      })
      return
    }

    // get the record id from the validated request body
    const fileRecordId = file.recordId
    const record = await selectRecordByRecordId(fileRecordId)

    // get the folder id from the validated request body and check if it exists
    const folderId = record?.folderId
    if (!folderId) {
      response.json({
        status: 404,
        data: null,
        message: 'Unable to post file.'
      })
      return
    }

    // get the folder owner and check if the user making the request is the owner of the folder
    const folder = await selectFolderByFolderId(folderId)
    const userId = folder?.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // get the file data from the validated request body
    const { recordId, fileDate, fileKey, fileUrl, ocrData } = validatedRequestBody.data

    // update the file with the new data
    file.recordId = recordId
    file.fileDate = fileDate
    file.fileKey = fileKey
    file.fileUrl = fileUrl
    file.ocrData = ocrData

    // update the file in the database
    const updatedFile = await updateFile(file)

    // return the file's attributes and a 200 response
    response.json({
      status: 200,
      data: updatedFile,
      message: 'File successfully updated!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting a file by its id
 * @endpoint GET /apis/file/id/:id **/
export async function getFileByFileIdController (request: Request, response: Response): Promise<void> {
  try {

    // parse the file id from the request parameters and validate it
    const validationResult = FileSchema.pick({ id: true }).safeParse({ id: request.params.id })
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // get the file id from the validated request parameters and check if it exists
    const { id } = validationResult.data
    const file: File | null = await selectFileByFileId(id)
    if (!file) {
      response.json({
        status: 404,
        data: null,
        message: 'File not found.'
      })
      return
    }
    
    // get the record id from the validated request body
    const fileRecordId = file.recordId
    const record = await selectRecordByRecordId(fileRecordId)

    // get the folder id from the validated request body and check if it exists
    const folderId = record?.folderId
    if (!folderId) {
      response.json({
        status: 404,
        data: null,
        message: 'Unable to post file.'
      })
      return
    }

    // get the folder owner and check if the user making the request is the owner of the folder
    const folder = await selectFolderByFolderId(folderId)
    const userId = folder?.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // return the file's attributes and a 200 response
    response.json({
      status: 200,
      data: file,
      message: 'File successfully found!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting files by record id
 * @endpoint GET /apis/file/recordId/:recordId **/
export async function getFilesByRecordIdController (request: Request, response: Response): Promise<void> {
  try {

    // parse the record id from the request parameters and validate it
    const validationResult = FileSchema.pick({ recordId: true }).safeParse({ recordId: request.params.recordId })
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // get the record id from the validated request parameters, the files associated with the record id, and check if they exist
    const { recordId } = validationResult.data
    const files: File[] | null = await selectFilesByRecordId(recordId)
    if (!files) {
      response.json({
        status: 404,
        data: null,
        message: 'No files found for the specified record id.'
      })
      return
    }

    // get the first file from the array of files and check if it exists
    const file: File | null = files[0]!
    if (!file) {
      response.json({
        status: 404,
        data: null,
        message: 'File not found.'
      })
      return
    }

    // get the record id from the validated request body
    const fileRecordId = files[0]!.recordId
    const record = await selectRecordByRecordId(fileRecordId)

    // get the folder id from the validated request body and check if it exists
    const folderId = record?.folderId
    if (!folderId) {
      response.json({
        status: 404,
        data: null,
        message: 'Unable to post file.'
      })
      return
    }

    // get the folder owner and check if the user making the request is the owner of the folder
    const folder = await selectFolderByFolderId(folderId)
    const userId = folder?.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // return the files' attributes and a 200 response
    response.json({
      status: 200,
      data: files,
      message: 'All files successfully found!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}