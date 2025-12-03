import { type Request, type Response } from 'express'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import { validateSessionUser } from '../../utils/auth.utils.ts'
import {
  type Folder,
  FolderSchema,
  insertFolder,
  updateFolder,
  deleteFolderRecursive,
  isDescendant,
  selectFolderByFolderId,
  selectFoldersByParentFolderId,
  selectFoldersByUserId,
  selectFolderByFolderName
} from './folder.model.ts'


/** Express controller for getting a folder by its id
 * @endpoint GET /apis/folder/id/:id **/
export async function getFolderByFolderIdController (request: Request, response: Response): Promise<void> {
  try {

    // pick and parse the folder id from the request parameters and validate it
    const validatedRequestParams = FolderSchema.pick({ id: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    const parentFolderId = validatedRequestParams.data.id

    // get the folder from the validated request body
    const folder: Folder | null = await selectFolderByFolderId(parentFolderId)

    // if the folder is not found, return a preformatted response to the client
    if (!folder) {
      response.status(404).json({
        status: 404,
        data: null,
        message: 'Get folder failed: Folder not found!'
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

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting folders by parent folder id
 * @endpoint GET /apis/folder/parentFolderId/:parentFolderId **/
export async function getFoldersByParentFolderIdController (request: Request, response: Response): Promise<void> {
  try {

    // parse the parent folder id from the request parameters and validate it
    const validatedRequestParams = FolderSchema.pick({ parentFolderId: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the parent folder id from the parameters and check if it exists
    const { parentFolderId } = validatedRequestParams.data
    if (!parentFolderId) {
      response.status(404).json({
        status: 404,
        data: null,
        message: 'Get folder failed: Parent folder id not found!'
      })
      return
    }

    // verify the parent folder exists and belongs to the session user
    const parentFolder = await selectFolderByFolderId(parentFolderId)
    if (!parentFolder) {
      response.status(404).json({
        status: 404,
        data: null,
        message: 'Get folder failed: Parent folder not found!'
      })
      return
    }

    // verify the session user owns the parent folder
    if (!(await validateSessionUser(request, response, parentFolder.userId))) return

    // now safely query child folders - filter by user to prevent data leakage
    const folders: Folder[] | null = await selectFoldersByParentFolderId(parentFolderId, parentFolder.userId)

    // Return empty array if no folders found (not an error condition)
    const folderData = folders || []

    // return the child folders to the client
    response.json({
      status: 200,
      data: folderData,
      message: folderData.length + ' folder(s) found under this parent folder.'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting folders by user id
 * @endpoint GET /apis/folder/userId/:userId **/
export async function getFoldersByUserIdController (request: Request, response: Response): Promise<void> {
  try {

    // pick and parse the user id from the request parameters and validate it
    const validatedRequestParams = FolderSchema.pick({ userId: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the user id from the validated request parameters and check if the session user is the owner of the folder
    const { userId } = validatedRequestParams.data
    if (!(await validateSessionUser(request, response, userId))) return

    // fetch folders for the authorized user
    const folders: Folder[] | null = await selectFoldersByUserId(userId)

    // Return empty array if no folders found (not an error condition)
    const folderData = folders || []

    // return the folders to the client
    response.json({
      status: 200,
      data: folderData,
      message: folderData.length > 0 ? 'Folders successfully found!' : 'No folders found for this user.'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting folders by name
 * @endpoint GET /apis/folder/name/:name **/
export async function getFolderByFolderNameController (request: Request, response: Response): Promise<void> {
  try {

    // pick and parse the folder name from the request parameters and validate it
    const validatedRequestParams = FolderSchema.pick({ name: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    const userId = request.session?.user?.id
    if (!userId) {
        response.status(401).json({
        status: 401,
        data: null,
        message: 'Get folder failed: Please login to continue!'
        })
        return
    }

    // get the folder from the validated request parameters
    const folder: Folder | null = await selectFolderByFolderName(validatedRequestParams.data.name, userId)

    // if the folder is not found, return a preformatted response to the client
    if (!folder) {
      response.status(404).json({
        status: 404,
        data: null,
        message: 'Get folder failed: Folder not found!'
      })
      return
    }

    // get the user id from the folder and check if the session user is the owner of the folder
    if (!(await validateSessionUser(request, response, folder.userId))) return

    // if the folder is found and authorized, return the folder attributes and a preformatted response to the client
    response.json({
      status: 200,
      data: folder,
      message: 'Folder successfully selected!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for creating a new folder
 * @endpoint POST /apis/folder **/
export async function postFolderController (request: Request, response: Response): Promise<void> {
  try {

    console.log('request body: ' + request.body.data)
    // parse the new folder data from the request body and validate it
    const validatedRequestBody = FolderSchema.safeParse(request.body)
    console.log('validated request body: ' + validatedRequestBody.data)
    if (!validatedRequestBody.success) {
      zodErrorResponse(response, validatedRequestBody.error)
      return
    }

    // get the new folder from the validated request body
    const { id, userId, parentFolderId, name } = validatedRequestBody.data

    // create a new folder object with the validated data
    const newFolder: Folder | null = { id, userId, parentFolderId, name }

    // if the folder data is missing, return a 400 response
    if (!newFolder) {
      response.status(400).json({
        status: 400,
        data: null,
        message: 'Post folder failed: Folder data is missing.'
      })
      return
    }

    // check if the session user is the owner of the folder
    if (!(await validateSessionUser(request, response, newFolder.userId))) return

    // check if a folder with the same name already exists
    const existingFolder = await selectFolderByFolderName(newFolder.name, newFolder.userId)
    if (existingFolder) {
      response.status(409).json({
        status: 409,
        data: null,
        message: 'Post folder failed: A folder with this name already exists.'
      })
      return
    }

    // insert the new folder data into the database
    const message = await insertFolder(newFolder)

    // return the success response to the client
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

/** Express controller for updating a folder
 * @endpoint PUT /apis/folder/id/:id **/
export async function putFolderController (request: Request, response: Response): Promise<void> {
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
      response.status(404).json({
        status: 404,
        data: null,
        message: 'Put folder failed: Folder not found.'
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
      if (!parentFolderId) {
        response.status(400).json({
          status: 400,
          data: null,
          message: 'Put folder failed: Cannot move folder to root folder.'
        })
        return
      }

      // verify the parent folder exists
      const parentFolder = await selectFolderByFolderId(parentFolderId)
      if (!parentFolder) {
        response.status(404).json({
          status: 404,
          data: null,
          message: 'Put folder failed: Parent folder not found.'
        })
        return
      }

      // verify the user owns the parent folder
      if (parentFolder.userId !== thisFolder.userId) {
        response.status(403).json({
          status: 403,
          data: null,
          message: 'Put folder failed: Forbidden: You cannot move a folder into another user\'s folder.'
        })
        return
      }

      // check if the new parent is a descendant
      if (await isDescendant(parentFolderId, id)) {
        response.status(400).json({
          status: 400,
          data: null,
          message: 'Put folder failed: Cannot move folder into its own descendant folder.'
        })
        return
      }
    }

    // update folder
    thisFolder.parentFolderId = parentFolderId
    thisFolder.name = name
    const message = await updateFolder(thisFolder)

    // return a success response to the client
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

/** Express controller for deleting a folder
 * @endpoint DELETE /apis/folder/id/:id **/
export async function deleteFolderController (request: Request, response: Response): Promise<void> {
  try {

    // pick and parse the folder id from the request parameters and validate it
    const validatedRequestParams = FolderSchema.pick({ id: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the folder id from the validated request parameters
    const { id } = validatedRequestParams.data

    // get the folder from the database and check if it exists
    const folder = await selectFolderByFolderId(id)
    if (!folder) {
      response.status(404).json({
        status: 404,
        data: null,
        message: 'Delete folder failed: Folder not found.'
      })
      return
    }

    // check if the session user is the owner of the folder
    const userId = folder.userId
    if (!(await validateSessionUser(request, response, userId))) return

    // check if the folder is a parent folder
    const parentFolderId = folder.parentFolderId
    if (!parentFolderId) {
      response.status(400).json({
        status: 400,
        data: null,
        message: 'Delete folder failed: Cannot delete a root folder.'
      })
      return
    }

    // Recursively delete the folder and all its contents
    const { foldersDeleted, recordsDeleted } = await deleteFolderRecursive(id, userId)

    // return a success response with counts
    response.json({
      status: 200,
      data: { foldersDeleted, recordsDeleted },
      message: `Successfully deleted ${foldersDeleted} folder(s) and ${recordsDeleted} file(s).`
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}