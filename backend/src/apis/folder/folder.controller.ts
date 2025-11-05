import { type Request, type Response } from 'express'
import { z } from 'zod/v4'
import {
  type Folder,
  FolderSchema,
  insertFolder,
  updateFolder,
  selectFolderByFolderId,
  selectFolderByFolderName,
  selectFoldersByUserId
} from './folder.model.ts'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import { generateJwt } from '../../utils/auth.utils.ts'
import pkg from 'jsonwebtoken'

const { verify } = pkg


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

    // check if the user is authorized to create a folder
    if (validationResult.data.userId !== user.id) {
      response.json({
        status: 403,
        data: null,
        message: 'User ID in request does not match authenticated user ID.'
      })
      return
    }

    // insert the new user data into the database
    const insertedFolder = await insertFolder(validationResult.data)

    // return the success response to the client
    response.json({
      status: 200,
      data: insertedFolder,
      message: 'Inserted folder successfully!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for updating a folder
 * @endpoint PUT /apis/folder/id/:folderIdGoesHere
 * @param request an object containing the body with folder data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the folder update was successful **/
export async function updateFolderController (request: Request, response: Response): Promise<void> {
  try {

    // validate the folder ID coming from the request parameters
    const validationResultForRequestParams = FolderSchema.pick({ id: true }).safeParse({ id: request.params.id })
    // if the validation of the params is unsuccessful, return a preformatted response to the client
    if (!validationResultForRequestParams.success) {
      zodErrorResponse(response, validationResultForRequestParams.error)
      return
    }

    // validate the folder update request data coming from the request body
    const validationResultForRequestBody = FolderSchema.pick({
      parentFolderId: true,
      userId: true,
      name: true
    }).safeParse(request.body)
    // if the validation of the body is unsuccessful, return a preformatted response to the client
    if (!validationResultForRequestBody.success) {
      zodErrorResponse(response, validationResultForRequestBody.error)
      return
    }

    // grab the user ID from the session
    const userFromSession = request.session?.user
    const userIdFromSession = userFromSession?.id
    // grab the user ID from the validated request body
    const { userId } = validationResultForRequestBody.data
    // if the user is not authorized to update the folder, return a preformatted response to the client
    if (userIdFromSession !== userId) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You do not own this folder.'
      })
      return
    }

    // grab the folder id from the validated request parameters
    const { id } = validationResultForRequestParams.data
    // grab the folder by id
    const folder: Folder | null = await selectFolderByFolderId(id)
    // if the folder does not exist, return a preformatted response to the client
    if (folder === null) {
      response.json({
        status: 404,
        data: null,
        message: 'Folder not found.'
      })
      return
    }

    // grab the folder data from the validated request body
    const { parentFolderId, name } = validationResultForRequestBody.data
    // update the folder with the new data
    folder.parentFolderId = parentFolderId
    folder.name = name

    // update the folder in the database
    await updateFolder(folder)

    // reissue the jwt token with the updated profile
    const jwt = request.session.jwt ?? ''
    // grab the signature off of the session
    const signature = request.session.signature ?? ''
    // if the jwt token or signature are undefined, return a preformatted response to the client
    const parsedJwt = verify(jwt, signature)
    // if the jwt token is invalid, return a preformatted response to the client
    if (typeof parsedJwt === 'string') {
      response.json({
        status: 401,
        data: null,
        message: 'Unauthorized: Invalid jwt token.'
      })
      return
    }

    // NEEDS WORK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // refresh the session with the updated folder
    // request.session.folder = {
    //   id: folder.id,
    //   parentFolderId: folder.parentFolderId,
    //   userId: folder.userId,
    //   name: folder.name
    // }

    // generate a new jwt token with the updated folder
    const newJwt = generateJwt(parsedJwt.auth, signature)
    // set the new jwt token in the session
    request.session.jwt = newJwt
    // set the authorization header with the new jwt token
    response.header({
      authorization: newJwt
    })

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

/** Express controller for getting a folder by its ID
 * @endpoint GET /apis/folder/id/:folderIdGoesHere
 * @param request an object containing the folder ID in params
 * @param response an object modeling the response that will be sent to the client
 * @returns response with the folder data or null if not found **/
export async function getFolderByFolderIdController (request: Request, response: Response): Promise<void> {
  try {

    // validate the folder ID from parameters
    const validationResult = FolderSchema.pick({ id: true }).safeParse({ id: request.params.id })

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // deconstruct the folder ID from the parameters
    const { id } = validationResult.data

    // if the folder is not found, return a preformatted response to the client
    if (validationResult.data === null) {
      response.json({
        status: 404,
        data: validationResult,
        message: 'Please provide a valid folder id!', // change this to a more descriptive message
      })
      return
    }

    // get the folder
    const folder: Folder | null = await selectFolderByFolderId(id)

    // if the folder is found, return the folder attributes and a preformatted response to the client
    response.json({
      status: 200,
      data: folder,
      message: 'Folders found successfully!'
    })

  } catch(error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting folders by user ID
 * @endpoint GET /apis/folder/user/:userIdGoesHere
 * @param request an object containing the user ID in params
 * @param response an object modeling the response that will be sent to the client
 * @returns response with an array of folders or error **/
export async function getFolderByUserIdController(request: Request, response: Response): Promise<void> {
  try{

    // validate the user ID from params
    const validationResult = z.object ({
      userId: z
        .uuidv7('Please provide a valid user id') })
        .safeParse({ userId: request.params.userId })

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success){
      zodErrorResponse(response, validationResult.error)
      return
    }

    // deconstruct the user ID from the parameters
    const { userId } = validationResult.data

    // create a folder array using the user ID
    const folders: Folder[] | null = await selectFoldersByUserId(userId)

    if (!folders[0]) {
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
      message: 'Found all folders successfully!'
    })

  } catch(error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting folders by name
 * @endpoint GET /apis/folder/name
 * @param request an object containing the folder name in params
 * @param response an object modeling the response that will be sent to the client
 * @returns response with an array of folders or error **/
export async function getFolderByFolderNameController(request: Request, response: Response): Promise<void> {
  try {
    // validate the folder name from params
    const validationResult = FolderSchema.pick({name: true}).safeParse({name: request.params.name})

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // deconstruct the folder name from the parameters
    const { name } = validationResult.data

    // if the folder name is not found, return a preformatted response to the client
    if (name === null) {
      response.json({
        status: 404,
        data: null,
        message: "Folder name not found!"})
      return
    }

    // get the folder
    const folder: Folder | null = await selectFolderByFolderName(name)

    // if the folder is found, return the folder attributes and a preformatted response to the client
    response.json({
      status: 200,
      data: folder,
      message: "Folder selected successfully!"
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}