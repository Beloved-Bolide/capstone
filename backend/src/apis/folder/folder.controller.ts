import type {Request, Response} from 'express'
import {z} from 'zod/v4'
import {type Folder, FolderSchema, insertFolder, selectFolderByFolderId, updateFolder} from './folder.model.ts'
import {serverErrorResponse, zodErrorResponse} from '../../utils/response.utils.ts'
import type {Status} from '../../utils/interfaces/Status.ts'
import {PrivateUserSchema} from "../user/user.model.ts";

/** Controller for updating an existing user profile
 *
 * This function handles PUT requests to update a profile's information. It validates
 * both the request body and parameters, checks session authorization, and updates
 * the profile in the database if all validations pass.
 *
 * @param {Request} request - Express request object containing:
 *   - body: Profile data to update (about, imageUrl, name)
 *   - params: URL parameters containing the profile id
 *   - session: Session data containing the authenticated user's profile
 * @param {Response} response - Express response object used to send back:
 *   - Success response with updated profile data
 *   - Error responses for validation failures, authorization issues, or missing profiles
 *
 * @returns {Promise<void>} Returns nothing, but sends JSON response to client
 *
 * @throws Will send error responses for:
 *   - Invalid request body (400)
 *   - Invalid request parameters (400)
 *   - Unauthorized update attempt (400)
 *   - Profile not found (400)
 *
 * @example
 * // PUT /api/profile/:id
 * // Request body: { about: "New bio", imageUrl: "https://...", name: "John Doe" }
 * //
 **/

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

    // check if the user is authenticated
    const user = request.session?.user
    if (!user) {
      response.json({
        status: 401,
        data: null,
        message: 'Please login to create a folder.'
      })
      return
    }

    // check if the user is authorized to update the profile
    if (validationResult.data.userId !== user.id) {
      response.json({
        status: 403,
        data: null,
        message: 'User ID in request does not match authenticated user ID.'
      })
      return
    }

    // insert the new user data into the database
    const message = await insertFolder(validationResult.data)

    // create a preformatted response to the client
    const status: Status = {
      status: 200,
      data: null,
      message: message
    }

    // return the response to the client
    response.json(status)

  } catch (error: any) {

    // catch any errors that occurred during the update process and return a response to the client
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting a folder by its ID
 * @endpoint GET /apis/folder/:folderId
 * @param request an object containing the folder ID in params
 * @param response an object modeling the response that will be sent to the client
 * @returns response with the folder data or null if not found **/
export async function getFolderByFolderIdController (request: Request, response: Response): Promise<void> {
  try {

    // validate the folder ID from parameters
    const validationResult = FolderSchema.pick({ id: true })

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // deconstruct the folder ID from the parameters
    const { id } = validationResult.data
    
    // get the folder
    const folder: Folder | null = await selectFolderByFolderId(id)
    
    response.json({
      status: 200,
      data: folder,
      message: null
    })

  } catch(error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}


export async function updateFolderController (request: Request, response: Response): Promise<void> {
  try {

    const validationResult = FolderSchema.safeParse(request.body)

    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // deconstruct the folder ID from the parameters
    const { id, parentFolderId, userId, name } = validationResult.data

    // check if the user is authorized to update the profile
    const user = request.session?.user
    if (!user) {
      response.json({
        status: 401,
        data: null,
        message: 'Please login to update a folder.'
      })
      return
    }

    // get the folder
    const folder = await selectFolderByFolderId(id)
    if (folder === null) {
      response.json({
        status: 404,
        data: null,
        message: 'Folder not found.'
      })
      return
    }

    // if the user is not authorized to update the profile, return a preformatted response to the client
    if (folder.userId !== user.id) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You do not own this folder.'
      })
      return
    }

    // if the folder name is unchanged, return a preformatted response to the client
    if (folder.name === name) {
      response.json({
        status: 200,
        data: folder,
        message: 'Folder name unchanged.'
      })
      return
    }

    // update the folder
    const updatedFolder = await updateFolder(validationResult.data)

    response.json({
      status: 200,
      data: updatedFolder,
      message: 'updateFolderController: Folder successfully updated.'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}






























