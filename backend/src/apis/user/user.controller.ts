import { type Request, type Response } from 'express'
import { type PrivateUser, PrivateUserSchema, selectPrivateUserByUserId, updateUser } from './user.model.ts'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import { generateJwt } from '../../utils/auth.utils.ts'
import { verify } from 'jsonwebtoken'


export async function updateUserController (request: Request, response: Response) {
  try {

    // validate the user id from the request parameters
    const validationResultForRequestParams = PrivateUserSchema.pick({ id: true }).safeParse({ id: request.params.id })
    // if the validation of the params is unsuccessful, return a preformatted response to the client
    if(!validationResultForRequestParams.success) {
      zodErrorResponse(response, validationResultForRequestParams.error)
      return
    }

    // validate the updated user data from the request body
    const validationResultForRequestBody = PrivateUserSchema.safeParse(request.body)
    // if the validation of the body is unsuccessful, return a preformatted response to the client
    if(!validationResultForRequestBody.success) {
      zodErrorResponse(response, validationResultForRequestBody.error)
      return
    }

    // get the id from the session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id

    // get the id from the validated request parameters
    const { id } = validationResultForRequestParams.data

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
    const { email, name, notifications, hash } = validationResultForRequestBody.data

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
    user.name = name
    user.notifications = notifications
    user.hash = hash

    await updateUser(user)

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
      name: user.name,
      notifications: user.notifications,
      hash: user.hash
    }

    // generate a new jwt token with the updated user
    const newJwt = generateJwt(parsedJwt.auth, signature)

    // update the session with the updated user data
    request.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      notifications: user.notifications,
      hash: user.hash
    }

    // update the session with the new jwt token
    request.session.jwt = newJwt
    // update the auth header with the new jwt token
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

























