import { type Request, type Response } from 'express'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import { generateJwt, validateSessionUser } from '../../utils/auth.utils.ts'
import {
  type PrivateUser,
  PrivateUserSchema,
  updatePrivateUser,
  selectPrivateUserByUserId
} from './user.model.ts'
import pkg from 'jsonwebtoken'
const { verify } = pkg


/** Express controller for getting user by user id
 * @endpoint GET /apis/user/id/:id **/
export async function getUserByUserIdController (request: Request, response: Response): Promise<void> {
  try {

    // parse the user id from the request parameters and validate it
    const validationResult = PrivateUserSchema.pick({ id: true }).safeParse(request.params)
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // get the user id from the validated parameters
    const { id } = validationResult.data

    // check if the session user is the same as the user from the request parameters
    if (!(await validateSessionUser(request, response, id))) return

    // get the user by id
    const user: PrivateUser | null = await selectPrivateUserByUserId(id)

    // if the user is not found, return 404
    if (!user) {
      response.json({
        status: 404,
        data: null,
        message: 'User not found.'
      })
      return
    }

    // return a 200 response
    response.json({
      status: 200,
      data: null,
      message: 'User successfully got!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for updating a user
 * @endpoint PUT /apis/user/id/:id **/
export async function putUserController (request: Request, response: Response) {
  try {

    // parse the user id from the request parameters and validate it
    const validatedRequestParams = PrivateUserSchema.pick({ id: true }).safeParse(request.params)
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // parse the user data from the request body and validate it
    const validatedRequestBody = PrivateUserSchema.safeParse(request.body)
    if (!validatedRequestBody.success) {
      zodErrorResponse(response, validatedRequestBody.error)
      return
    }

    // get the user id from the validated request parameters and check if they exist
    const { id } = validatedRequestParams.data
    const paramId = id
    if (!id) {
      response.json({
        status: 404,
        data: null,
        message: 'Put user failed: User not found.'
      })
      return
    }

    // check if the user id from the request body exists and matches the user id from the request parameters
    const bodyId = validatedRequestBody.data.id
    if (bodyId !== paramId) {
      response.json({
        status: 403,
        data: null,
        message: 'Put user failed: Forbidden: You cannot update another user\'s data.'
      })
    }

    // check that the session user is the same as the user from the request parameters
    if (!(await validateSessionUser(request, response, id))) return

    // get the user data from the validated request body
    const { email, hash, name, notifications } = validatedRequestBody.data

    // get the user by id and check if they exist
    const user: PrivateUser | null = await selectPrivateUserByUserId(id)
    if (!user) {
      response.json({
        status: 404,
        data: null,
        message: 'Put user failed: User not found.'
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
        message: 'Put user failed: Unauthorized: Invalid token.'
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

    // update the session with the new jwt token and authorization header
    request.session.jwt = newJwt
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