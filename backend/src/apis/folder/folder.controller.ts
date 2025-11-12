import { type Request, type Response } from 'express'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import { validateSessionUser } from '../../utils/auth.utils.ts'
import { type PrivateUser, selectPrivateUserByUserId } from '../user/user.model.ts'
import {
  type Folder,
  FolderSchema,
  insertFolder,
  updateFolder,
  selectFolderByFolderId,
  selectFoldersByParentFolderId,
  selectFoldersByUserId,
  selectFolderByFolderName
} from './folder.model.ts'


/** Express controller for creating a new folder
 * @endpoint POST /apis/folder
 * @param request an object containing the body with folder data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the folder creation was successful **/
export async function postFolderController (request: Request, response: Response): Promise<void> {
  try {

    // validate the new user data coming from the request body
    const validationResult = FolderSchema.safeParse(request.body)
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // grab the user id from the session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id
    // grab the userId from the request body
    const { userId } = validationResult.data
    // if the user id from the request body does not match the user id from the session, return a preformatted response to the client
    if (userId !== idFromSession) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot create a folder for another user.'
      })
      return
    }

    // insert the new folder data into the database
    const insertedFolder = await insertFolder(validationResult.data)

    // return the success response to the client
    response.json({
      status: 200,
      data: null,
      message: 'New folder successfully created!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for updating a folder
 * @endpoint PUT /apis/folder/id/:id
 * @param request an object containing the parameters and body with folder data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the folder update was successful **/
export async function updateFolderController (request: Request, response: Response): Promise<void> {
  try {

    // validate the folder id coming from the request parameters
    const validationResultForRequestParams = FolderSchema.pick({ id: true }).safeParse({ id: request.params.id })
    // if the validation of the params is unsuccessful, return a preformatted response to the client
    if (!validationResultForRequestParams.success) {
      zodErrorResponse(response, validationResultForRequestParams.error)
      return
    }

    // validate the updated folder data coming from the request body
    const validationResultForRequestBody = FolderSchema.safeParse(request.body)
    // if the validation of the body is unsuccessful, return a preformatted response to the client
    if (!validationResultForRequestBody.success) {
      zodErrorResponse(response, validationResultForRequestBody.error)
      return
    }

    // get the folder from the validated request body
    const folder: Folder | null = await selectFolderByFolderId(validationResultForRequestParams.data.id)
    // get the user id from the folder
    const userId: string | undefined | null = folder?.userId
    // grab the user id from the session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id

    // if the user id from the request body does not match the user id from the session, return a preformatted response to the client
    if (userId !== idFromSession) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot create a folder for another user.'
      })
      return
    }

    // if the folder is not found, return a preformatted response to the client
    if (folder === null) {
      response.json({
        status: 404,
        data: null,
        message: 'Folder not found.'
      })
      return
    }

    // get the folder data from the validated request body
    const { parentFolderId, name } = validationResultForRequestBody.data

    // update the folder with the new data
    folder.parentFolderId = parentFolderId
    folder.name = name

    // update the folder in the database
    await updateFolder(folder)

    // if the folder update was successful, return a preformatted response to the client
    response.json({
      status: 200,
      data: null,
      message: 'Folder successfully updated!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting a folder by its id
 * @endpoint GET /apis/folder/id/:id
 * @param request an object containing the folder id in params
 * @param response an object modeling the response that will be sent to the client
 * @returns response with the folder data or null if not found **/
export async function getFolderByFolderIdController (request: Request, response: Response): Promise<void> {
  try {

    // validate the folder id from parameters
    const validationResult = FolderSchema.pick({ id: true }).safeParse({ id: request.params.id })
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // get the folder from the validated request body
    const folder: Folder | null = await selectFolderByFolderId(validationResult.data.id)
    // get the user id from the folder
    const userId: string | undefined | null = folder?.userId
    // grab the user id from the session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id

    // if the user id from the request body does not match the user id from the session, return a preformatted response to the client
    if (userId !== idFromSession) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot create a folder for another user.'
      })
      return
    }

    // if the folder is not found, return a preformatted response to the client
    if (folder === null) {
      response.json({
        status: 404,
        data: null,
        message: 'Folder not found!'
      })
      return
    }

    // if the folder is found, return the folder attributes and a preformatted response to the client
    response.json({
      status: 200,
      data: folder,
      message: 'Folder successfully found!'
    })

  } catch(error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting folders by parent folder id
 * @endpoint GET /apis/folder/parent/:parentFolderIdGoesHere
 * @param request an object containing the parent folder id in params (use 'root' for root folders)
 * @param response an object modeling the response that will be sent to the client
 * @returns response with an array of child folders or error **/
export async function getFoldersByParentFolderIdController (request: Request, response: Response): Promise<void> {
  try {

    // parse the parent folder id from the request parameters and validate it
    const validatedRequestParams = FolderSchema.pick({ parentFolderId: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // if the parent folder id does not exist, return a 404 response
    const { parentFolderId } = validatedRequestParams.data
    if (!parentFolderId) {
      response.json({
        status: 404,
        data: null,
        message: 'Parent folder not found.'
      })
      return
    }

    // get all folders with the specified parent folder id and check if any folders were found
    const folders: Folder[] | null = await selectFoldersByParentFolderId(parentFolderId)
    if (!folders) {
      response.json({
        status: 404,
        data: null,
        message: 'No folders found with this parent folder id.'
      })
      return
    }

    // get the user id from the first folder in folders
    const userId = folders[0]?.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // Return all folders
    response.json({
      status: 200,
      data: folders,
      message: folders.length + ' folders successfully found!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting folders by user id
 * @endpoint GET /apis/folder/user/:id
 * @param request an object containing the user id in params
 * @param response an object modeling the response that will be sent to the client
 * @returns response with an array of folders or error **/
export async function getFoldersByUserIdController(request: Request, response: Response): Promise<void> {
  try {

    // validate the user id from params
    const validationResult = FolderSchema.pick({ userId: true }).safeParse({ userId: request.params.id })
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // get the user from the validated request parameters
    const user: PrivateUser | null = await selectPrivateUserByUserId(validationResult.data.userId)
    // get the user id from the user
    const userId: string | null | undefined = user?.id

    // grab the user id from the session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id

    // if the user id from the request parameters does not match the user id from the session, return a preformatted response to the client
    if (userId !== idFromSession) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot create a folder for another user.'
      })
      return
    }

    // create a folder array using the user id
    const folders: Folder[] | null = await selectFoldersByUserId(validationResult.data.userId)

    if (!folders[0] || folders === null) {
      response.json({
        status: 404,
        data: null,
        message: 'No folders found for this user.'
      })
      return
    }

    // if more than 0 folders are found, return all folders
    response.json({
      status: 200,
      data: folders,
      message: 'All folders successfully found!'
    })

  } catch(error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting folders by name
 * @endpoint GET /apis/folder/:name
 * @param request an object containing the folder name in the parameters
 * @param response an object modeling the response that will be sent to the client
 * @returns response with an array of folders or error **/
export async function getFolderByFolderNameController (request: Request, response: Response): Promise<void> {
  try {

    // validate the folder name from params
    const validationResult = FolderSchema.pick({ name: true }).safeParse({ name: request.params.name })

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // get the folder from the validated request parameters
    const folder: Folder | null = await selectFolderByFolderName(validationResult.data.name)
    // get the user id from the folder
    const userId: string | undefined | null = folder?.userId

    // grab the user id from the session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id

    // if the user id from the request parameters does not match the user id from the session, return a preformatted response to the client
    if (userId !== idFromSession) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot create a folder for another user.'
      })
      return
    }

    // deconstruct the folder name from the parameters
    const name: string = validationResult.data.name

    // if the folder name is not found, return a preformatted response to the client
    if (name === null) {
      response.json({
        status: 404,
        data: null,
        message: "Folder not found!"})
      return
    }

    // if the folder is found, return the folder attributes and a preformatted response to the client
    response.json({
      status: 200,
      data: folder,
      message: "Folder successfully selected!"
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}