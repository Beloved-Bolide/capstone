import {type PrivateUser, PrivateUserSchema, selectPrivateUserByUserEmail} from '../user/user.model'
import {generateJwt, validatePassword} from '../../utils/auth.utils'
import type {Request, Response} from 'express'
import {zodErrorResponse} from '../../utils/response.utils'
import {v4 as uuid} from 'uuid'
import type {Status} from '../../utils/interfaces/Status'
import {z} from 'zod/v4'

/**
 * Express controller for sign-in
 * @endpoint POST /apis/sign-in/
 * @param request an object containing the body contain an email and password.
 * @param response an object modeling the response that will be sent to the client.
 * @returns response to the client indicating whether the sign in was successful or not
 * @throws {Error} an error indicating what went wrong
 */

export async function signinController (request: Request, response: Response): Promise<void> {
  try {
    // validate the new user data coming from the request body
    const validationResult = PrivateUserSchema
      .pick({email: true})
      .extend({
        password: z
          .string('Password is required.')
          .min(8, 'Password must be at least 8 characters.')
          .max(32, 'Password must be at least 8 characters.')
      }).safeParse(request.body)

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // deconstruct the email and password from the request body
    const { email, password } = validationResult.data

    // select the user by the email from the database
    const user: PrivateUser | null = await selectPrivateUserByUserEmail(email)

    // create a preformatted response to the client if the sign in fails
    const signinFailedStatus: Status = {
      status: 400,
      message: 'Email or password is incorrect; please try again.',
      data: null
    }

    // if the user is null, return a preformatted response to the client
    if (user === null) {
      response.json(signinFailedStatus)
      return
    }

    // check if the password matches the hash
    const isPasswordValid = await validatePassword(user.hash, password)

    // if sign in failed, return a response to the client
    if (!isPasswordValid) {
      response.json(signinFailedStatus)
      return
    }

    // if sign in was successful, create a new session for the client and return a response to the client
    // deconstruct the id, name, and notifications from the user
    const { id, name, notifications } = user

    // generate a new signature for the session
    const signature: string = uuid()

    // generate a new jwt for the session using the id, name, notifications, and signature
    const authorization: string = generateJwt({
      id,
      name,
      notifications,
    }, signature)

    // set the session variables
    request.session.user = user
    request.session.jwt = authorization
    request.session.signature = signature

    // set the authorization header
    response.header({
      authorization
    })

    // return a response to the client
    response.json({
      status: 200,
      message: 'Sign in successful!',
      data: null
    })
    return

    // catch any errors that occurred during the sign-in process and return a response to the client
  } catch (error: any) {
    response.json({
      status: 500,
      data: null,
      message: error.message
    })
  }
}