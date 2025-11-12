import { type Request, type Response } from 'express'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import { type Folder, selectFolderByFolderId } from '../folder/folder.model.ts'
import { validateSessionUser } from '../../utils/auth.utils.ts'
import { type Category, selectCategoryByCategoryId } from '../category/category.model.ts'
import { z } from 'zod/v4'
import {
  type Record,
  RecordSchema,
  insertRecord,
  updateRecord,
  deleteRecord,
  selectRecordByRecordId,
  selectRecordsByFolderId,
  selectRecordsByCategoryId,
  selectRecordsByCompanyName,
  selectRecordsByLastAccessedAt,
  selectRecordByName,
  searchRecords
} from './record.model.ts'


/** Express controller for creating a new record
 * @endpoint POST /apis/record/
 * @param request an object containing the body with record data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the record creation was successful **/
export async function postRecordController (request: Request, response: Response): Promise<void> {
  try {

    // parse the data from the request body and check if it's valid
    const validatedRequestBody = RecordSchema.safeParse(request.body)
    if (!validatedRequestBody.success) {
      zodErrorResponse(response, validatedRequestBody.error)
      return
    }

    // put the new record data into a variable
    const newRecord: Record = validatedRequestBody.data

    // insert the new record data into the database
    await insertRecord(newRecord)

    // return the success response to the client
    response.json({
      status: 200,
      data: null,
      message: newRecord.name + ' successfully added!'
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

    // parse the id from the request parameters and check if it's valid
    const validatedRequestParams = RecordSchema.pick({ id: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the record id from the validated request parameters, get the existing record, and check if it exists
    const { id } = validatedRequestParams.data
    const existingRecord: Record | null = await selectRecordByRecordId(id)
    if (!existingRecord) {
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
    if (!(await validateSessionUser(request, response, userId))) return

    // parse the record data from the request body and check if it's valid
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
      if (!(await validateSessionUser(request, response, newFolderUserId))) {
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

/** Express controller for deleting a record
 * @endpoint DELETE /apis/record/:id
 * @param request an object containing the record id in params
 * @param response an object modeling the response that will be sent to the client
 * @returns success response or error **/
export async function deleteRecordController (request: Request, response: Response): Promise<void> {
  try {

    // parse the record id from the request parameters and check if it's valid
    const validatedRequestParams = RecordSchema.pick({ id: true }).safeParse({ id: request.params.id })
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the record id from the validated request parameters
    const { id } = validatedRequestParams.data

    // get the user from the current session and check if they are signed in
    const user = request.session?.user
    if (!user) {
      response.json({
        status: 401,
        data: null,
        message: 'Unauthorized: Please log in to perform this action.'
      })
      return
    }

    // get the record by id and check if it exists
    const record = await selectRecordByRecordId(id)
    if (!record) {
      response.json({
        status: 404,
        data: null,
        message: 'Record not found!'
      })
      return
    }

    // get the folder owner from the record and check if the user is the owner
    const folder = await selectFolderByFolderId(record.folderId)
    const userId = folder?.userId

    // check if the user making the request is the owner of the folder
    if (!(await validateSessionUser(request, response, userId))) return

    // delete the record
    const message = await deleteRecord(id)

    // return a success response
    response.json({
      status: 200,
      data: null,
      message: message
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
 * @returns success response or error **/
export async function getRecordByRecordIdController (request: Request, response: Response): Promise<void> {
  try {

    // parse the recordId from the request parameters and check if it's valid
    const validatedRequestParams = RecordSchema.pick({ id: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the existing record by record id first to verify existence
    const { id } = validatedRequestParams.data
    const record: Record | null = await selectRecordByRecordId(id)
    if (!record) {
      response.json({
        status: 404,
        data: null,
        message: 'Record not found!'
      })
      return
    }

    // verify ownership using the existing record's folderId
    const existingFolder: Folder | null = await selectFolderByFolderId(record.folderId)
    const userId = existingFolder?.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // return a success response
    response.json({
      status: 200,
      data: record,
      message: record.name + ' selected by record id!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting record by folderId
 * @endpoint GET /apis/record/folderId/:folderId
 * @param request an object containing the folderId in params
 * @param response an object modeling the response that will be sent to the client
 * @returns success response or error **/
export async function getRecordsByFolderIdController (request: Request, response: Response): Promise<void> {
  try {

    // parse the folderId from the request parameters and check if it's valid
    const validatedRequestParams = RecordSchema.pick({ folderId: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the folderId from the validated request parameters
    const { folderId } = validatedRequestParams.data
    const existingFolder: Folder | null = await selectFolderByFolderId(folderId)

    // if the folder does not exist, return a 404 error
    if (!existingFolder) {
      response.json({
        status: 404,
        data: null,
        message: 'Records with that folder id do not exist.'
      })
      return
    }

    // get the user id from the folder in the validated request parameters and verify ownership
    const userId: string | undefined | null = existingFolder?.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // select the records by folder id
    const records: Record[] | null = await selectRecordsByFolderId(folderId)

    // return a success response
    response.json({
      status: 200,
      data: records,
      message: "Records by folder id successfully got!"
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting record by categoryId
 * @endpoint GET /apis/record/categoryId/:categoryId
 * @param request an object containing the categoryId in params
 * @param response an object modeling the response that will be sent to the client
 * @returns success response or error **/
export async function getRecordsByCategoryIdController (request: Request, response: Response): Promise<void> {
  try {

    // parse the categoryId from the request parameters and check if it's valid
    const validatedRequestParams = RecordSchema.pick({ categoryId: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the categoryId from the validated request parameters and check if it exists
    const { categoryId } = validatedRequestParams.data
    const category: Category | null = await selectCategoryByCategoryId(categoryId)
    if (!category) {
      response.json({
        status: 404,
        data: null,
        message: 'No records found for that category.'
      })
      return
    }

    // get the user id from the category in the validated request body and verify it exists
    const records: Record[] | null = await selectRecordsByCategoryId(categoryId)
    if (!records) {
      response.json({
        status: 404,
        data: null,
        message: 'No records found for that category.'
      })
      return
    }

    // get the folderId from the first record in the validated request body and verify it exists
    const folderId = records[0]?.folderId
    if (!folderId) {
      response.json({
        status: 404,
        data: null,
        message: 'No records found for that category.'
      })
      return
    }

    // get the user id from the folder in the validated request body and verify ownership
    const folder: Folder | null = await selectFolderByFolderId(folderId)
    const userId = folder?.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // return a success response
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

/** Express controller for getting record by companyName
 * @endpoint GET /apis/record/companyName/:companyName
 * @param request an object containing the companyName in params
 * @param response an object modeling the response that will be sent to the client
 * @returns success response or error **/
export async function getRecordsByCompanyNameController (request: Request, response: Response): Promise<void> {
  try {

    // parse the companyName from the request parameters and check if it's valid
    const validatedRequestParams = RecordSchema.pick({ companyName: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the companyName from the validated request parameters and check if it exists
    const { companyName } = validatedRequestParams.data
    if (!companyName) {
      response.json({
        status: 404,
        data: null,
        message: 'No records found with that company name.'
      })
      return
    }

    // get the records by company name and check if it exists
    const records: Record[] | null = await selectRecordsByCompanyName(companyName)
    if (!records) {
      response.json({
        status: 404,
        data: null,
        message: 'No records found with that company name.'
      })
      return
    }

    // get the folderId from the first record in the validated request body and verify it exists
    const folderId = records[0]?.folderId
    if (!folderId) {
      response.json({
        status: 404,
        data: null,
        message: 'No records found for that company name.'
      })
      return
    }

    // select the first folder, user id from the existing folder, and verify ownership
    const existingFolder: Folder | null = await selectFolderByFolderId(folderId)
    const userId = existingFolder?.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // return a success response
    response.json({
      status: 200,
      data: records,
      message: 'Records selected by company name!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting record by when it was last accessed at
 * @endpoint GET /apis/record/lastAccessedAt/:lastAccessedAt
 * @param request an object containing the lastAccessedAt in params
 * @param response an object modeling the response that will be sent to the client
 * @returns success response or error **/
export async function getRecordsByLastAccessedAtController (request: Request, response: Response): Promise<void> {
  try {

    // parse the companyName from the request parameters and check if it's valid
    const validatedRequestParams = RecordSchema.pick({ lastAccessedAt: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the companyName from the validated request parameters and check if it exists
    const { lastAccessedAt } = validatedRequestParams.data
    if (!lastAccessedAt) {
      response.json({
        status: 404,
        data: null,
        message: 'No records found that were last accessed at that time.'
      })
      return
    }

    // get the record by when it was last accessed and check if it exists
    const records: Record[] | null = await selectRecordsByLastAccessedAt(lastAccessedAt)
    if (!records || records[0] === undefined) {
      response.json({
        status: 404,
        data: null,
        message: 'No records found with that were accessed at that time.'
      })
      return
    }

    // get the folderId from the first record in the validated request body and verify it exists
    const folderId = records[0]?.folderId
    if (!folderId) {
      response.json({
        status: 404,
        data: null,
        message: 'No records found with that were accessed at that time.'
      })
      return
    }

    // select the folder, user id from the existing folder, and verify ownership
    const existingFolder: Folder | null = await selectFolderByFolderId(folderId)
    const userId = existingFolder?.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // return a success response
    response.json({
      status: 200,
      data: records,
      message: 'Records selected by when they were last accessed!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting record by name
 * @endpoint GET /apis/record/name/:name
 * @param request an object containing the record name in params
 * @param response an object modeling the response that will be sent to the client
 * @returns success response or error **/
export async function getRecordByNameController (request: Request, response: Response): Promise<void> {
  try {

    // parse the name from the request parameters and check if it's valid
    const validatedRequestParams = RecordSchema.pick({ name: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the name from the validated request parameters and check if it exists
    const { name } = validatedRequestParams.data
    if (!name) {
      response.json({
        status: 404,
        data: null,
        message: 'No record with that name because that record does not exist.'
      })
      return
    }

    // get the record by name and check if it exists
    const record: Record | null = await selectRecordByName(name)
    if (!record) {
      response.json({
        status: 404,
        data: null,
        message: 'No record found with that name found.'
      })
      return
    }

    // select the folder, user id from the existing folder, and verify ownership
    const existingFolder: Folder | null = await selectFolderByFolderId(record.folderId)
    const userId = existingFolder?.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // return a success response
    response.json({
      status: 200,
      data: record,
      message: record.name + ' selected by name!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for searching for a record
 * @endpoint GET /apis/record/search/
 * @param request an object containing the search query in query params
 * @param response an object modeling the response that will be sent to the client
 * @returns an array of records that match the search query **/
export async function searchRecordsController (request: Request, response: Response): Promise<void> {
  try {

    // validate the search query using zod
    const validatedRequestParams = z.object({
      q: z.string().min(1, 'Please enter a search term.')
    }).safeParse({ q: request.query.q })

    // if the validation fails, return an error response
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the search query from the validated request parameters
    const { q: searchTerm } = validatedRequestParams.data

    // limit query parameter to a maximum of 50 records
    const limit = request.query.limit ? parseInt(request.query.limit as string) : 50

    // search for records that match the search query
    const records: Record[] | null = await searchRecords(searchTerm, limit)

    // if no records are found, return a 404 response
    if (!records) {
      response.json({
        status: 404,
        data: null,
        message: 'No records found with that search term.'
      })
      return
    }

    // return a success response with the search results
    response.json({
      status: 200,
      data: records,
      message: records.length + ' record(s) found!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}