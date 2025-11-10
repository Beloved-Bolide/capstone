import { type Request, type Response } from 'express'
import {
  type File,
  FileSchema,
  insertFile,
  updateFile,
  selectFileByFileId,
  selectFilesByRecordId
} from './file.model.ts'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'


/** Express controller for creating a new file
 * @endpoint POST /apis/file
 * @param request an object containing the body with file data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the file creation was successful **/
export async function postFileController (request: Request, response: Response): Promise<void> {
  try {

    // validate the new file data coming from the request body
    const validationResult = FileSchema.safeParse(request.body)
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // insert the new file data into the database
    const insertedFile = await insertFile(validationResult.data)

    // return the success response to the client
    response.json({
      status: 200,
      data: null,
      message: 'New file successfully created!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for updating a file
 * @endpoint PUT /apis/file/id/:id
 * @param request an object containing the parameters and body with file data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the file update was successful **/
export async function updateFileController (request: Request, response: Response): Promise<void> {
  try {

    // validate the file id coming from the request parameters
    const validationResultForRequestParams = FileSchema.pick({ id: true }).safeParse({ id: request.params.id })
    // if the validation of the params is unsuccessful, return a preformatted response to the client
    if (!validationResultForRequestParams.success) {
      zodErrorResponse(response, validationResultForRequestParams.error)
      return
    }

    // validate the updated file data coming from the request body
    const validationResultForRequestBody = FileSchema.safeParse(request.body)
    // if the validation of the body is unsuccessful, return a preformatted response to the client
    if (!validationResultForRequestBody.success) {
      zodErrorResponse(response, validationResultForRequestBody.error)
      return
    }

    // get the file from the validated request body
    const file: File | null = await selectFileByFileId(validationResultForRequestParams.data.id)

    // if the file is not found, return a preformatted response to the client
    if (file === null) {
      response.json({
        status: 404,
        data: null,
        message: 'File not found.'
      })
      return
    }

    // get the file data from the validated request body
    const { recordId, fileDate, fileKey, fileUrl, isStarred, ocrData } = validationResultForRequestBody.data

    // update the file with the new data
    file.recordId = recordId
    file.fileDate = fileDate
    file.fileKey = fileKey
    file.fileUrl = fileUrl
    file.isStarred = isStarred
    file.ocrData = ocrData

    // update the file in the database
    await updateFile(file)

    // if the file update was successful, return a preformatted response to the client
    response.json({
      status: 200,
      data: null,
      message: 'File successfully updated!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting a file by its id
 * @endpoint GET /apis/file/id/:id
 * @param request an object containing the file id in params
 * @param response an object modeling the response that will be sent to the client
 * @returns response with the file data or null if not found **/
export async function getFileByFileIdController (request: Request, response: Response): Promise<void> {
  try {

    // validate the file id from parameters
    const validationResult = FileSchema.pick({ id: true }).safeParse({ id: request.params.id })
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // get the file from the validated request body
    const file: File | null = await selectFileByFileId(validationResult.data.id)

    // if the file is not found, return a preformatted response to the client
    if (file === null) {
      response.json({
        status: 404,
        data: null,
        message: 'File not found!'
      })
      return
    }

    // if the file is found, return the file attributes and a preformatted response to the client
    response.json({
      status: 200,
      data: file,
      message: 'File successfully found!'
    })

  } catch(error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting files by record id
 * @endpoint GET /apis/file/record/:id
 * @param request an object containing the record id in params
 * @param response an object modeling the response that will be sent to the client
 * @returns response with an array of files or error **/
export async function getFileByRecordIdController (request: Request, response: Response): Promise<void> {
  try {

    // validate the record id from params
    const validationResult = FileSchema.pick({ recordId: true }).safeParse({ recordId: request.params.id })
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // create a file array using the record id
    const files: File[] | null = await selectFilesByRecordId(validationResult.data.recordId)

    // if no files are found, return a preformatted response to the client
    if (!files[0] || files === null) {
      response.json({
        status: 404,
        data: null,
        message: 'No files found for this record.'
      })
      return
    }

    // if more than 0 files are found, return all files
    response.json({
      status: 200,
      data: files,
      message: 'All files successfully found!'
    })

  } catch(error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}