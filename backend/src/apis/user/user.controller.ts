import { type Request, type Response } from 'express'
import {PrivateUserSchema} from "./user.model.ts";
import {zodErrorResponse} from "../../utils/response.utils.ts";


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

    // NEW CODE HERE

  } catch (error: any) {

  }
}

























