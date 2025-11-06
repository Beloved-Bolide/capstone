import { type Request, type Response } from 'express'
import {
  type Record,
  RecordSchema,
  insertRecord,
  selectRecordByRecordId, updateRecord
} from './record.model.ts'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import {type Folder, selectFolderByFolderId} from "../folder/folder.model.ts";


/** Express controller for creating a new record
 * @endpoint POST /apis/record
 * @param request an object containing the body with record data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the record creation was successful **/
export async function postRecordController (request: Request, response: Response): Promise<void> {
  try {

    // validate the full record object from the request body
    const validationResult = RecordSchema.safeParse(request.body);

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // get the folder from the validated request body
    const folder: Folder | null = await selectFolderByFolderId(validationResult.data.folderId)
    // get the user id from the folder
    const userId: string | undefined | null = folder?.userId
    // get the user id from the session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id
    // if the user id from the request body does not match the user id from the session, return a preformatted response to the client
    if (userId !== idFromSession) {
      response.json ({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot create a record for another user.'
      })
      return
    }

    // insert the new record data into the database
    const insertedRecord = await insertRecord(validationResult.data)

    // return the success response to the client
    response.json({
      status:200,
      data: null,
      message: insertedRecord
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

    // validate the record id coming from the request parameters
    const validationResultForRequestParams = RecordSchema.pick({ id : true }).safeParse({ id: request.params.id })
    // if the validation of the params is unsuccessful, return a preformatted response to the client
    if (!validationResultForRequestParams.success){
      zodErrorResponse(response,validationResultForRequestParams.error)
      return
    }

    // validate the record update request data coming from the request body
    const validationResultForRequestBody = RecordSchema.safeParse(request.body)
    // if the validation of the body is unsuccessful, return a preformatted response to the client
    if (!validationResultForRequestBody.success){
      zodErrorResponse(response,validationResultForRequestBody.error)
      return
    }

    // get the folder from the validated request body
    const folder: Folder | null = await selectFolderByFolderId(validationResultForRequestBody.data.folderId)
    // get the user id from the folder
    const userId: string | undefined | null = folder?.userId
    // get the user id from the session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id
    // if the user id from the request body does not match the user id from the session, return a preformatted response to the client
    if (userId !== idFromSession) {
      response.json ({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot create a record for another user.'
      })
      return
    }

    // grab the record id from the validated request parameters
    const { id } = validationResultForRequestParams.data
    // grab the record by id
    const record: Record | null = await selectRecordByRecordId(id)
    // if the record does not exist, return a preformatted response to the client
    if (record === null) {
      response.json({
        status: 404,
        data: null,
        message: 'Record not found.'
      })
      return
    }

   // grab the record data from the validated request body
    const{
      folderId,
      categoryId,
      amount,
      companyName ,
      couponCode ,
      description ,
      expDate,
      lastAccessedAt,
      name,
      notifyOn,
      productId,
      purchaseDate } = validationResultForRequestBody.data

    //update the record with the new data
    record.folderId = folderId
    record.categoryId = categoryId
    record.amount = amount
    record.companyName = companyName
    record.couponCode = couponCode
    record.description = description
    record.expDate = expDate
    record.lastAccessedAt = lastAccessedAt
    record.name = name
    record.notifyOn = notifyOn
    record.productId = productId
    record.purchaseDate = purchaseDate

    // update the record in the database
    await updateRecord(record)

    //if the record update was successful, return a preformatted response to the client
    response.json({
      status: 200,
      data: null,
      message: 'record successfully updated!'
    })

  } catch (error:any) {
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
    const validationResult = RecordSchema.pick({ id: true }).safeParse({ id: request.params.id })
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response,validationResult.error)
      return
    }

    //if the record is not found, return a preformatted response to the client
    if (validationResult.data === null) {
      response.json({
        status: 404,
        data: null,
        message: 'Record not found!'
      })
      return
    }

    // grab the record id from the parameters
    const { id } = validationResult.data

    // get the record
    const record: Record | null = await selectRecordByRecordId(id)

    //if the record is found, return the record attributes and a preformatted response to the client
    response.json({
      status: 200,
      data: record,
      message: 'Record found successfully!'
    })

  } catch (error:any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}










