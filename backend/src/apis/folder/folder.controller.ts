import type {Request, Response} from 'express'
import {FolderSchema, insertFolder} from './folder.model.ts'
import {serverErrorResponse, zodErrorResponse} from '../../utils/response.utils.ts'
import type {Status} from '../../utils/interfaces/Status.ts'

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

/**
 *
 */

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






























