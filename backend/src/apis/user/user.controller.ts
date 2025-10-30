import type {Request, Response} from 'express'
import {
  updateUser,
  type
    User,
    UserSchema,
    //selectUserById,

    // PublicUserSchema,
    // selectPublicFollowersByUserId,
    // selectPublicFollowingByUserId,
    // selectPublicUserByUserId,
    // selectPublicUserByUserName,
    // selectPublicUsersByUserName
} from './user.model.ts'
import {serverErrorResponse, zodErrorResponse} from '../../utils/response.utils.ts'
import {generateJwt} from '../../utils/auth.utils.ts'
import pkg from 'jsonwebtoken'; const {verify} = pkg

// /**
//  * Express controller for getting the public user by id
//  * @param request from the client to the server to get all threads by thread user id
//  * @param response from the server to the client with all threads by thread user id or an error message
//  * @return A promise containing the response for the client with the requested information,
//  * or null if the information could not be found, set to the data field.
//  */
//
// export async function getPublicUserByUserIdController (request: Request, response: Response): Promise<void> {
//   try {
//     // validate the id coming from the request parameters
//     const validationResult = PublicUserSchema.pick({id: true}).safeParse(request.params)
//
//     // if the validation is unsuccessful, return a preformatted response to the client
//     if (!validationResult.success) {
//       zodErrorResponse(response, validationResult.error)
//       return
//     }
//
//     // grab the id off of the validated request parameters
//     const {id} = validationResult.data
//
//     // return the response to the client with the requested information
//     response.json({
//       status: 200,
//       message: 'Successfully retrieved user!',
//       data: null
//     })
//   } catch (error: unknown) {
//     console.error(error)
//     // if an error occurs, return a preformatted response to the client
//     serverErrorResponse(response, null)
//   }
// }
//
// /**
//  * Express controller for getting the public user by name
//  * @param request from the client to the server to get all by thread user id
//  * @param response from the server to the client with all threads by thread user id or an error message
//  * @return A promise containing the response for the client with the requested information,
//  * or null if the information could not be found, set to the data field.
//  */
//
// export async function getPublicUserByUserNameController (request: Request, response: Response): Promise<void> {
//   try {
//     // validate the name coming from the request parameters
//     const validationResult = PublicUserSchema.pick({name: true}).safeParse(request.params)
//
//     // if the validation is unsuccessful, return a preformatted response to the client
//     if (!validationResult.success) {
//       zodErrorResponse(response, validationResult.error)
//       return
//     }
//
//     // grab the name off of the validated request parameters
//     const {name} = validationResult.data
//
//     // grab the user by name
//     const data = await selectPublicUserByUserName(name)
//
//   } catch (error: unknown) {
//
//   }
// }

/**
 * Express controller for updating the user
 * @param request from the client to the server to update the user
 * @param response from the server to the client with the updated user or an error message
 * @return a promise containing the response with the updated user, or an error message if the user does not exist
 */

export async function putUserController (request: Request, response: Response): Promise<void> {
  try {

    // validate the updated user data coming from the request body
    const validationResultForRequestBody = UserSchema.safeParse(request.body)

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResultForRequestBody.success) {
      zodErrorResponse(response, validationResultForRequestBody.error)
      return
    }

    // validate the id coming from the request parameters
    const validationResultForRequestParams = UserSchema.pick({id: true}).safeParse(request.params)

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResultForRequestParams.success) {
      zodErrorResponse(response, validationResultForRequestParams.error)
      return
    }

    // grab user and id from the session
    const userFromSession = request.session?.user
    const idFromSession = userFromSession?.id

    // grab the id off of the validated request parameters
    const {id} = validationResultForRequestParams.data

    // if the user from the session does not match the id from the request parameters, return an error response
    if (idFromSession !== id) {
      response.json({
        status: 400,
        message: 'You are not authorized to update this user!',
        data: null
      })
    }

    // grab the user data off of the validated request body
    const {name, notifications} = validationResultForRequestBody.data

    // grab the user by id
    const user: User | null = await selectUserById(id)

    // if the user does not exist, return an error response
    if (user === null) {
      response.json({
        status: 400,
        message: 'User does not exist!',
        data: null
      })
      return
    }

    // update the user with the new data
    user.name = name
    user.notifications = notifications

    // Come back to this later!! profile.controller.ts line: 175

  } catch (error: unknown) {
    response.json({
      status: 500,
      message: 'Internal server error.',
      data: null
    })
  }
}