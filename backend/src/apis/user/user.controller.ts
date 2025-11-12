import { type Request, type Response } from 'express'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import { generateJwt } from '../../utils/auth.utils.ts'
import pkg from 'jsonwebtoken'
const { verify } = pkg
import { type PrivateUser, 
  PrivateUserSchema,
  updatePrivateUser,
  selectPrivateUserByUserId
} from './user.model.ts'


/** Express controller for updating a user
 * @endpoint PUT /apis/user/:id
 * @param request from the client to the server with the user id and updated user data
 * @param response from the server to the user with a status code and a message
 * @returns a success response to the client if the user is updated successfully, a forbidden response if the user is not authorized to update the user, and a not found response if the user is not found **/
export async function updatePrivateUserController (request: Request, response: Response) {
  try {

    // parse the user id from the request parameters and validate it
    const validatedRequestParams = PrivateUserSchema.pick({ id: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // get the user id from the validated request parameters, check if they exist, and validate the user
    const paramId = validatedRequestParams.data
    if (!paramId) {
      response.json({
        status: 404,
        data: null,
        message: 'User not found.'
      })
      return
    }
    if (!(await validateSessionUser(request, response, paramId)))

    // parse the user data from the request body and validate it
    const validatedRequestBody = PrivateUserSchema.safeParse(request.body)
    if (!validatedRequestBody.success) {
      zodErrorResponse(response, validatedRequestBody.error)
      return
    }

    const bodyId = validatedRequestBody.data
    if (!bodyId) {
      response.json({
        status: 404,
        data: null,
        message: 'User not found.'
      })
    }

    // get the user id from the session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id

    // if the id from the request parameters does not match the id from the session, return a preformatted response to the client
    if (id !== idFromSession) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You cannot update another user.'
      })
      return
    }

    // get the user data from the validated request body
    const { email, hash, name, notifications } = validatedRequestBody.data

    // get the user by id
    const user: PrivateUser | null = await selectPrivateUserByUserId(id)

    // if the user does not exist, return a preformatted response to the client
    if (user === null) {
      response.json({
        status: 404,
        data: null,
        message: 'User not found.'
      })
      return
    }

    // update the user with the new data
    user.email = email
    user.hash = hash
    user.name = name
    user.notifications = notifications

    // update the user in the database
    await updatePrivateUser(user)

    // reissue the jwt token with the updated user
    const jwt = request.session.jwt ?? ''
    // get the signature from the session
    const signature = request.session.signature ?? ''
    // if the jwt toke or signature are undefined, return a preformatted response to the client
    const parsedJwt = verify(jwt, signature)
    // if the jwt token is invalid, return a preformatted response to the client
    if (typeof parsedJwt === 'string') {
      response.json({
        status: 401,
        data: null,
        message: 'Unauthorized: Invalid token.'
      })
      return
    }
    // update the parsed jwt token with the updated user data
    parsedJwt.auth = {
      id: user.id,
      email: user.email,
      hash: user.hash,
      name: user.name,
      notifications: user.notifications
    }

    // generate a new jwt token with the updated user
    const newJwt = generateJwt(parsedJwt.auth, signature)

    // update the session with the updated user data
    request.session.user = {
      id: user.id,
      activationToken: user.activationToken,
      email: user.email,
      hash: user.hash,
      name: user.name,
      notifications: user.notifications
    }

    // update the session with the new jwt token
    request.session.jwt = newJwt
    // update the authorization header with the new jwt token
    response.header({
      authorization: newJwt
    })

    // return a success response to the client
    response.json({
      status: 200,
      data: null,
      message: 'User successfully updated!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}


/** Express controller for getting user by user id
 * @endpoint GET /apis/user/id/:idGoesHere
 * @param request an object containing the user id in params
 * @param response an object modeling the response that will be sent to the client
 * @returns response with the user data or error
 **/
export async function getUserByUserIdController (request: Request, response: Response): Promise<void> {
  try {

    // validate the user id from params
    const validationResult = PrivateUserSchema.pick({ id: true }).safeParse({ id: request.params.id })
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // Get the user id from the validated parameters
    const { id } = validationResult.data

    // Get the logged-in user from session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id

    // Security check: Only allow users to view their own data
    if (id !== idFromSession) {
      response.json({
        status: 403,
        data: null,
        message: 'Forbidden: You can only view your own user data.'
      })
      return
    }

    // Get the user by id
    const user: PrivateUser | null = await selectPrivateUserByUserId(id)

    // If the user is not found, return 404
    if (user === null) {
      response.json({
        status: 404,
        data: null,
        message: 'User not found.'
      })
      return
    }

    // Return the user data (without sensitive fields for public endpoints)
    // For now returning full private user since it's authenticated
    response.json({
      status: 200,
      data: user,
      message: 'User found successfully!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}




























