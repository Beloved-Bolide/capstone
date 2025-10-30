import type {NextFunction, Request, Response} from 'express'
import {
  PrivateUserSchema,
  selectPrivateUserByUserActivationToken,
  updateUser
} from '../user/user.model'
import type {Status} from '../../utils/interfaces/Status'

import {zodErrorResponse} from '../../utils/response.utils'
import {z} from 'zod/v4'





export async function activationController(request: Request, response: Response): Promise<void> {

  try{
    const validationResult = z
    .object({
      activation:z
      .string('activation is required')
      .length(32,'please provide a valid activation token')
    }).safeParse(request.params)

    //if the validation is unsuccessful, return a preformatted to the client
    if (!validationResult.success){
      zodErrorResponse(response, validationResult.error)
      return
    }

    //deconstruct the activationToken from the request only
  }
}