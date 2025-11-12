import { type Request, type Response } from 'express'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import { validateSessionUser } from '../../utils/auth.utils.ts'
import {
  type Folder,
  FolderSchema,
  insertFolder,
  updateFolder,
  deleteFolder,
  isDescendant,
  hasChildFolders,
  hasRecords,
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

    // parse the new folder data from the request body and validate it
    const validatedRequestBody = FolderSchema.safeParse(request.body)
    if (!validatedRequestBody.success) {
      zodErrorResponse(response, validatedRequestBody.error)
      return
    }
    
    // grab the userId from the request body and validate it
    const { userId } = validatedRequestBody.data
    if (!(await validateSessionUser(request, response, userId))) return

    // check if a folder with the same name already exists
    const existingFolder = await selectFolderByFolderName(validatedRequestBody.data.name)
    if (existingFolder) {
      response.json({
        status: 409,
        data: null,
        message: 'A folder with this name already exists.'
      })
      return
    }

    // insert the new folder data into the database
    const newFolder = await insertFolder(validatedRequestBody.data)

    // return the success response to the client
    response.json({
      status: 201,
      data: newFolder,
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
    
    // validate folder id from params
    const validatedRequestParams = FolderSchema.pick({ id: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get and verify existing folder
    const { id } = validatedRequestParams.data
    const thisFolder = await selectFolderByFolderId(id)
    if (!thisFolder) {
      response.json({
        status: 404,
        data: null,
        message: 'Folder not found.'
      })
      return
    }

    // verify the user owns this folder
    if (!(await validateSessionUser(request, response, thisFolder.userId))) return

    // validate update data
    const validatedRequestBody = FolderSchema
      .pick({
        name: true,
        parentFolderId: true
      })
      .safeParse(request.body)
    if (!validatedRequestBody.success) {
      zodErrorResponse(response, validatedRequestBody.error)
      return
    }

    // deconstruct the update data from the request body
    const { parentFolderId, name } = validatedRequestBody.data

    // if changing parent folder, validate it
    if (parentFolderId !== thisFolder.parentFolderId && parentFolderId !== null) {
      
      // prevent circular references
      if (parentFolderId === id) {
        response.json({
          status: 400,
          data: null,
          message: 'A folder cannot be its own parent.'
        })
        return
      }

      // verify the parent folder exists
      const parentFolder = await selectFolderByFolderId(parentFolderId)
      if (!parentFolder) {
        response.json({
          status: 404,
          data: null,
          message: 'Parent folder not found.'
        })
        return
      }

      // verify the user owns the parent folder
      if (parentFolder.userId !== thisFolder.userId) {
        response.json({
          status: 403,
          data: null,
          message: 'Cannot move folder to another user\'s folder.'
        })
        return
      }

      // check if the new parent is a descendant
      if (await isDescendant(parentFolderId, id)) {
        response.json({
          status: 400,
          data: null,
          message: 'Cannot move a folder into its own subfolder.'
        })
        return
      }
    }

    // update folder
    thisFolder.parentFolderId = parentFolderId
    thisFolder.name = name
    await updateFolder(thisFolder)

    // return a success response to the client
    response.json({
      status: 200,
      data: thisFolder,
      message: 'Folder successfully updated!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for deleting a folder
 * @endpoint DELETE /apis/folder/id/:id
 * @param request an object containing the folder id in params
 * @param response an object modeling the response that will be sent to the client
 * @returns success response or error **/
export async function deleteFolderController (request: Request, response: Response): Promise<void> {
  try {

    // pick and parse the folder id from the request parameters and validate it
    const validatedRequestParams = FolderSchema.pick({ id: true }).safeParse({ id: request.params.id })
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the folder id from the validated request parameters
    const { id } = validatedRequestParams.data

    // get the folder from the database and check if it exists
    const folder = await selectFolderByFolderId(id)
    if (!folder) {
      response.json({
        status: 404,
        data: null,
        message: 'Folder not found.'
      })
      return
    }

    // check if the session user is the owner of the folder
    const userId = folder.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // check if the folder is a parent folder
    const parentFolderId = folder.parentFolderId
    if (!parentFolderId) {
      response.json({
        status: 400,
        data: null,
        message: 'Cannot delete a root folder.'
      })
      return
    }

    // check if the folder has any child folders or files
    const hasChildren = await hasChildFolders(id)
    const hasItems = await hasRecords(id)
    if (hasChildren || hasItems) {
      response.json({
        status: 400,
        data: null,
        message: 'Cannot delete a folder that contains items.'
      })
      return
    }

    // delete the folder
    const message = await deleteFolder(id)

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

/** Express controller for getting a folder by its id
 * @endpoint GET /apis/folder/id/:id
 * @param request an object containing the folder id in params
 * @param response an object modeling the response that will be sent to the client
 * @returns response with the folder data or null if not found **/
export async function getFolderByFolderIdController (request: Request, response: Response): Promise<void> {
  try {

    // pick and parse the folder id from the request parameters and validate it
    const validatedRequestParams = FolderSchema.pick({ id: true }).safeParse({ id: request.params.id })
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the folder from the validated request body
    const folder: Folder | null = await selectFolderByFolderId(validatedRequestParams.data.id)

    // if the folder is not found, return a preformatted response to the client
    if (folder === null) {
      response.json({
        status: 404,
        data: null,
        message: 'Folder not found!'
      })
      return
    }

    // get the user id from the folder and check if the session user is the owner of the folder
    const userId: string | undefined | null = folder.userId
    if (!(await validateSessionUser(request, response, userId))) return

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
    const validatedRequestParams = FolderSchema.safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the parent folder id from the parameters and check if it exists
    const { parentFolderId } = validatedRequestParams.data
    if (!parentFolderId) {
      response.json({
        status: 404,
        data: null,
        message: 'Parent folder not found.'
      })
      return
    }

    // First, verify the parent folder exists and belongs to the session user
    const parentFolder = await selectFolderByFolderId(parentFolderId)
    if (!parentFolder) {
      response.json({
        status: 404,
        data: null,
        message: 'Parent folder not found.'
      })
      return
    }

    // verify the session user owns the parent folder
    if (!(await validateSessionUser(request, response, parentFolder.userId))) return

    // now safely query child folders
    const folders: Folder[] | null = await selectFoldersByParentFolderId(parentFolderId)
    if (!folders) {
      response.json({
        status: 404,
        data: null,
        message: 'No folders found under this parent folder.'
      })
      return
    }

    // return the child folders to the client
    response.json({
      status: 200,
      data: folders,
      message: folders.length + ' folder(s) found under this parent folder.'
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

    // pick and parse the user id from the request parameters and validate it
    const validatedRequestParams = FolderSchema.pick({ userId: true }).safeParse({ userId: request.params.id })
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the user id from the validated request parameters and check if the session user is the owner of the folder
    const userId = validatedRequestParams.data.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // fetch folders for the authorized user
    const folders: Folder[] = await selectFoldersByUserId(userId)

    // if no folders are found for the user, return a 404 response
    if (folders.length === 0) {
      response.json({
        status: 404,
        data: null,
        message: 'No folders found for this user.'
      })
      return
    }

    // return the folders to the client
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

    // pick and parse the folder name from the request parameters and validate it
    const validatedRequestParams = FolderSchema.pick({ name: true }).safeParse({ name: request.params.name })
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the folder from the validated request parameters
    const folder: Folder | null = await selectFolderByFolderName(validatedRequestParams.data.name)

    // if the folder is not found, return a preformatted response to the client
    if (!folder) {
      response.json({
        status: 404,
        data: null,
        message: "Folder not found!"
      })
      return
    }

    // get the user id from the folder and check if the session user is the owner of the folder
    if (!(await validateSessionUser(request, response, folder.userId))) return

    // if the folder is found and authorized, return the folder attributes and a preformatted response to the client
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