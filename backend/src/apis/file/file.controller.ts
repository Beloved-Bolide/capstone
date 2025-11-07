import {serverErrorResponse, zodErrorResponse} from "../../utils/response.utils.ts"
import type {Request, Response} from "express"

/** Express controller for creating a new file
 * @endpoint POST /apis/file
 * @param request an object containing the body with file data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the file creation was successful **/
export async function postFileController (request: Request, response: Response): Promise<void> {
  try {
    // validate the new file data coming from the request body
    const validationResult = FileSchema.safeParse(request.body)
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }
      // // grab the user id from the session
      // const userFromSession = request.session?.user
      // const idFromSession = userFromSession?.id
      // // grab the new data from the request body
      // const { userId } = validationResult.data
      // // if the user id from the request body does not match the user id from the session, return a preformatted response to the client
      // if (userId !== idFromSession) {
      //   response.json({
      //     status: 403,
      //     data: null,
      //     message: 'Forbidden: You cannot create a file for another user.'
      //   })
      //   return
      // }

    //insert the new file data into the database
    const inserterdFile = await
    insertFile(validationResult.data)

    //create a preformatted response to the client
    const status: Status = {
      status: 200,
      data: null,
      message: insertedFile
    }

    // return the success response to the client
    response.json({
      status: 200,
      data: null,
      message: insertedFile
    })


  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}
