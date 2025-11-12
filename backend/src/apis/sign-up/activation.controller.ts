import type { NextFunction, Request, Response } from 'express'
import { PrivateUserSchema, selectPrivateUserByUserActivationToken, updatePrivateUser } from '../user/user.model'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils'
import { z } from 'zod/v4'

export async function activationController (request: Request, response: Response): Promise<void> {
  try {
    // store the new user data coming from the request body in a variable
    const validationResult = z
      .object({
        activation:z
        .string('activation is required')
        .length(32, 'please provide a valid activation token')
    }).safeParse(request.params)

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // deconstruct the activationToken from the request body
    const { activation } = validationResult.data

    // select the user by activationToken
    const user = await selectPrivateUserByUserActivationToken(activation)

    // if the user is null, return a preformatted response to the client
    if (user === null) {
      response.json({
        status: 400,
        data: null,
        message: 'Account activation has failed. Have you already activated this account?'
      })
      return
    }

    // if the user is not null, update the activationToken to null and send a success response
    user.activationToken = null
    await updatePrivateUser(user)

    response.json({
      status: 200,
      data: null,
      message: 'Account activation was successful'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}