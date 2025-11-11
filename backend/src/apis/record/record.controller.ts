import { type Request, type Response } from 'express'
import {
  type Record,
  RecordSchema,
  insertRecord,
  selectRecordByRecordId, updateRecord, selectRecordsByFolderId, selectRecordsByCategoryId
} from './record.model.ts'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import { type Folder, selectFolderByFolderId } from '../folder/folder.model.ts'


/** Express controller for creating a new record
 * @endpoint POST /apis/record
 * @param request an object containing the body with record data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the record creation was successful **/
export async function postRecordController (request: Request, response: Response): Promise<void> {
  try {

    // validate the full record object from the request body
    const validateRequestBody = RecordSchema.safeParse(request.body)
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validateRequestBody.success) {
      zodErrorResponse(response, validateRequestBody.error)
      return
    }

    // get the folder from the validated request body and get the user id from the folder
    const folder: Folder | null = await selectFolderByFolderId(validateRequestBody.data.folderId)
    const userId: string | undefined | null = folder?.userId

    // get the user id from the session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id

    // check if the user id from the request body matches the user id from the session
    if (userId !== idFromSession) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot create a record for another user.'
      })
      return
    }

    // insert the new record data into the database
    const insertedRecord = await insertRecord(validateRequestBody.data)

    // return the success response to the client
    response.json({
      status: 200,
      data: insertedRecord,
      message: 'Record successfully inserted!'
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
    const validateRequestParams = RecordSchema.safeParse(request.params)
    // if the validation of the params is unsuccessful, return a preformatted response to the client
    if (!validateRequestParams.success) {
      zodErrorResponse(response, validateRequestParams.error)
      return
    }

    // validate the record update request data coming from the request body
    const validateRequestBody = RecordSchema.safeParse(request.body)
    // if the validation of the body is unsuccessful, return a preformatted response to the client
    if (!validateRequestBody.success) {
      zodErrorResponse(response, validateRequestBody.error)
      return
    }

    // get the folder from the validated request body and get the user id from the folder
    const folder: Folder | null = await selectFolderByFolderId(validateRequestBody.data.folderId)
    const userId: string | undefined | null = folder?.userId

    // get the user id from the session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id

    // if the user id from the request body does not match the user id from the session, return a preformatted response to the client
    if (userId !== idFromSession) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot create a record for another user.'
      })
      return
    }

    // grab the record id from the validated request parameters
    const { id } = validateRequestParams.data
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
    const {
      folderId,
      categoryId,
      amount,
      companyName,
      couponCode,
      description,
      expDate,
      lastAccessedAt,
      name,
      notifyOn,
      productId,
      purchaseDate
    } = validateRequestBody.data

    // update the record with the new data
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

    // if the record update was successful, return a preformatted response to the client
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
    const validateRequestParams = RecordSchema.pick({ id: true }).safeParse({ id: request.params.id })
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validateRequestParams.success) {
      zodErrorResponse(response, validateRequestParams.error)
      return
    }

    //if the record is not found, return a preformatted response to the client
    if (validateRequestParams.data === null) {
      response.json({
        status: 404,
        data: null,
        message: 'Record not found!'
      })
      return
    }

    // grab the record id from the parameters
    const { id } = validateRequestParams.data

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
    const validateRequestParams = RecordSchema.pick({ folderId: true }).safeParse({ folderId: request.params.folderId })
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validateRequestParams.success) {
      zodErrorResponse(response, validateRequestParams.error)
      return
    }

    // get the user id from the folder in the validated request body
    const folder: Folder | null = await selectFolderByFolderId(validateRequestParams.data.folderId)
    const userId: string | undefined | null = folder?.userId

    // get the user id from the session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id

    // if the user id from the request body does not match the user id from the session, return a preformatted response to the client
    if (userId !== idFromSession) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot create a record for another user.'
      })
      return
    }

    // deconstruct the folderId from the parameters
    const { folderId } = validateRequestParams.data

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
    const validateRequestParams = RecordSchema.safeParse(request.params)
    if (!validateRequestParams.success) {
      zodErrorResponse(response, validateRequestParams.error)
      return
    }

    // get the record from the validated request parameters
    // if no records with this category id are found, return a 404 error
    const records: Record[] | null = await selectRecordsByCategoryId(validateRequestParams.data.categoryId)
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
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id

    // if the user id from the request parameters does not match the user id from the session, return a preformatted response to the client
    if (userId !== idFromSession) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot create a record for another user.'
      })
      return
    }

    // deconstruct the categoryId from the parameters
    const { categoryId } = validateRequestParams.data

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








