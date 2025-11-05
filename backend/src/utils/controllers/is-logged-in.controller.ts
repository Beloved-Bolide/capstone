import type  { NextFunction, Request, Response } from 'express'
import type { Status } from '../interfaces/Status'
import pkg from 'jsonwebtoken'
import type { PrivateUser } from '../../apis/user/user.model.ts'
const { verify } = pkg

export function isLoggedInController (request: Request, response: Response, next: NextFunction): void {

  // set a predefined response if the user is not logged in
  const status: Status = {
    status: 401,
    data: null,
    message: 'Please login.'
  }

  try {

    // grab the user from the session
    const user: PrivateUser | undefined = request.session?.user

    // grab the signature from the session
    const signature: string | undefined = request.session?.signature ?? ''

    // grab the unparsed jwt from the request header
    const unverifiedJwtToken: string | undefined = request.headers?.authorization

    // if the user, jwt token, or signature are undefined, return the status
    if (user === undefined || signature === undefined || unverifiedJwtToken === undefined) {
      response.json(status)
    }

    // if the jwt token from the request header does not match the jwt token from the session, return the status
    if (!unverifiedJwtToken || unverifiedJwtToken !== request.session?.jwt) {
      response.json(status)
      return
    }

    // verify that the jwt token from the session is valid
    verify(unverifiedJwtToken, signature)

    // if the jwt token from the session is valid, call the next middleware
    next()

  } catch (error: unknown) {
    // if an error occurs, return the status
    response.json(status)
  }
}