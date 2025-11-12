import * as argon2 from 'argon2'
import * as crypto from 'crypto'
import { type Request, response } from 'express'
import pkg from 'jsonwebtoken'
const { sign } = pkg

// generate a jwt token
export function generateJwt (payload: object, signature: string): string {
  const setExpInSecondsSinceEpoch = (currentTimestamp: number): number => {
    const oneHourInMilliseconds: number = 3600000 * 3
    const futureTimestamp: number = Math.round(currentTimestamp) + oneHourInMilliseconds
    const futureTimestampInSeconds: number = futureTimestamp / 1000
    return Math.round(futureTimestampInSeconds)
  }

  const iat = new Date().getTime()
  const exp = setExpInSecondsSinceEpoch(iat)
  return sign({exp, auth: payload, iat}, signature)
}

// generate a random activation token
export function setActivationToken (): string {
  return crypto.randomBytes(16).toString('hex')
}

// hash a password
export async function setHash (password: string): Promise<string> {
  return await argon2.hash (
    password,
    {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      hashLength: 32
    })
}

// validate a password
export async function validatePassword (hash: string, password: string): Promise<boolean> {
  return await argon2.verify (
    hash,
    password
  )
}

// validate the session user
export async function validateSessionUser (request: Request, userId: string | undefined): Promise<boolean> {

  // if the user id is undefined or null, return false
  if (userId === undefined || userId === null) return false

  // get the user id from the session
  const sessionUser = request.session?.user
  const sessionUserId = sessionUser?.id

  // check if the user id from the request body matches the user id from the session
  if (userId !== sessionUserId) {
    response.json({
      status: 403,
      data: null,
      message: 'Forbidden: You do not have access to this resource. Please login with the correct credentials.'
    })
    return false
  }
  return true
}