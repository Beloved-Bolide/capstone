import { type Request, type Response } from 'express'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import { type Folder, selectFolderByFolderId } from '../folder/folder.model.ts'
import {
  type Record,
  RecordSchema,
  insertRecord,
  updateRecord,
  selectRecordByRecordId,
  selectRecordsByFolderId,
  selectRecordsByCategoryId
} from './record.model.ts'
import { validateSessionUser } from "../../utils/auth.utils.ts";


/** Express controller for creating a new record
 * @endpoint POST /apis/record
 * @param request an object containing the body with record data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the record creation was successful **/
export async function postRecordController (request: Request, response: Response): Promise<void> {
  try {

    // parse the request body and check if it's valid
    const validatedRequestBody = RecordSchema.safeParse(request.body)
    if (!validatedRequestBody.success) {
      zodErrorResponse(response, validatedRequestBody.error)
      return
    }

    // get the folder from the validated request body and get the user id from that folder
    const folder: Folder | null = await selectFolderByFolderId(validatedRequestBody.data.folderId)
    const userId = folder?.userId

    // if the session user is not the folder's owner, return a 403 error
    if (!(await validateSessionUser(request, userId))) return

    // insert the new record data into the database
    await insertRecord(validatedRequestBody.data)

    // return the success response to the client
    response.json({
      status: 200,
      data: null,
      message: validatedRequestBody.data.name + ' successfully added!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for updating a record
 * @endpoint PUT /apis/record/id/:id
 * @param request an object containing the body with the record data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the folder update was successful **/
export async function updateRecordController (request: Request, response: Response): Promise<void> {
  try {

    // parse the request params and check if it's valid
    const validatedRequestParams = RecordSchema.pick({ id: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the record id from the validated request parameters and get the existing record
    const { id } = validatedRequestParams.data
    const existingRecord: Record | null = await selectRecordByRecordId(id)

    // if the record does not exist, return a 404 error
    if (existingRecord === null) {
      response.json({
        status: 404,
        data: null,
        message: 'Record not found.'
      })
      return
    }

    // get the folder from the validated request body and get the user id from that folder
    const folder: Folder | null = await selectFolderByFolderId(existingRecord.folderId)
    const userId = folder?.userId

    // if the session user is not the folder's owner, return a 403 error
    if (!(await validateSessionUser(request, userId))) return

    // parse the request body and check if it's valid
    const validatedRequestBody = RecordSchema.safeParse(request.body)
    if (!validatedRequestBody.success) {
      zodErrorResponse(response, validatedRequestBody.error)
      return
    }

    // if updating folderId, verify the new folder also belongs to this user
    if (validatedRequestBody.data.folderId !== existingRecord.folderId) {

      // get the new folder's user id from the validated request body
      const newFolder: Folder | null = await selectFolderByFolderId(validatedRequestBody.data.folderId)
      const newFolderUserId = newFolder?.userId

      // if the new folder's user id does not match the session user's id, return a 403 error
      if (!(await validateSessionUser(request, newFolderUserId))) {
        response.json({
          status: 403,
          data: null,
          message: 'Forbidden: You cannot move a record to another user\'s folder.'
        })
        return
      }
    }

    // update the record in the database
    await updateRecord(validatedRequestBody.data)

    // return a preformatted response to the client upon successful update
    response.json({
      status: 200,
      data: null,
      message: 'Record successfully updated!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting a record by its id
 * @endpoint GET /apis/record/id/:id
 * @param request an object containing the record id in params
 * @param response an object modeling the response that will be sent to the client
 * @returns response with the record data or null if not found **/
export async function getRecordByRecordIdController (request: Request, response: Response): Promise<void> {
  try {

    // validate the record id from parameters
    const validatedRequestParams = RecordSchema.pick({ id: true }).safeParse({ id: request.params.id })
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    //if the record is not found, return a preformatted response to the client
    if (validatedRequestParams.data === null) {
      response.json({
        status: 404,
        data: null,
        message: 'Record not found!'
      })
      return
    }

    // grab the record id from the parameters
    const { id } = validatedRequestParams.data

    // get the record
    const record: Record | null = await selectRecordByRecordId(id)

    //if the record is found, return the record attributes and a preformatted response to the client
    response.json({
      status: 200,
      data: record,
      message: 'Record selected by record id successfully selected!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting record by folderId
 * @endpoint GET /apis/record/folder/:id
 * @param request an object containing the folderId in params
 * @param response an object modeling the response that will be sent to the client
 * @returns response with an array of record or error **/
export async function getRecordsByFolderIdController (request: Request, response: Response): Promise<void> {
  try {

    //validate the folderId from params
    const validatedRequestParams = RecordSchema.pick({ folderId: true }).safeParse({ folderId: request.params.folderId })
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the user id from the folder in the validated request body
    const folder: Folder | null = await selectFolderByFolderId(validatedRequestParams.data.folderId)
    const userId: string | undefined | null = folder?.userId

    // get the user id from the session
    const sessionUser = request.session?.user
    const sessionUserId = sessionUser?.id

    // if the user id from the request body does not match the user id from the session, return a preformatted response to the client
    if (userId !== sessionUserId) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot create a record for another user.'
      })
      return
    }

    // deconstruct the folderId from the parameters
    const { folderId } = validatedRequestParams.data

    // if the folderId is not found,return a preformatted response to the client
    if (folderId === null) {
      response.json({
        status: 404,
        data: null,
        message: "Record not found"
      })
      return
    }

    // get the records
    const records: Record[] | null = await selectRecordsByFolderId(folderId)

    // if the records are found, return the records
    response.json({
      status: 200,
      data: records,
      message: "Record got by folder id successfully selected!"
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting record by categoryId
 * @endpoint GET /apis/record/category/id/:id
 * @param request an object containing the categoryId in params
 * @param response an object modeling the response that will be sent to the client
 * @returns response with an array of record or error **/
export async function getRecordsByCategoryIdController (request: Request, response: Response): Promise<void> {
  try {

    // parse the categoryId from the request parameters and check if it's valid
    const validatedRequestParams = RecordSchema.safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the record from the validated request parameters
    // if no records with this category id are found, return a 404 error
    const records: Record[] | null = await selectRecordsByCategoryId(validatedRequestParams.data.categoryId)
    if (!records) {
      response.json({
        status: 404,
        data: null,
        message: "Records with that category id not found!"
      })
      return
    }

    // get the folder from the record array
    const folderId = records[0]?.folderId
    // if no folder with this folder id isn't found, return a preformatted response to the client
    if (!folderId) {
      response.json({
        status: 404,
        data: null,
        message: "Records with that category id not found!"
      })
      return
    }

    // get the folder using the folder id
    const folder: Folder | null = await selectFolderByFolderId(folderId)

    // get the user id from the category
    const userId: string | undefined | null = folder?.userId

    // get the user id from the session
    const sessionUser = request.session?.user
    const sessionUserId = sessionUser?.id

    // if the user id from the request parameters does not match the user id from the session, return a preformatted response to the client
    if (userId !== sessionUserId) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot create a record for another user.'
      })
      return
    }

    // deconstruct the categoryId from the parameters
    const { categoryId } = validatedRequestParams.data

    // if the categoryId is not found, return a preformatted response to the client
    if (categoryId === null) {
      response.json({
        status: 404,
        data: null,
        message: "Records with that category id not found"
      })
      return
    }

    //if the record is found, return the record attributes and a preformatted response to the client
    response.json({
      status: 200,
      data: records,
      message: "Records with that category id successfully selected!"
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}