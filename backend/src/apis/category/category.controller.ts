import type { Request, Response } from 'express'
import{
  type Category,
  CategorySchema
} from './category.model.ts'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import  { selectPrivateUserByUserActivationToken } from '../user/user.model.ts'
import { selectCategoryByCategoryId } from './category.model.ts'


/** Express controller for getting the Category by id
 * @param request from the client to the server to get all Categories by CategoryID
 * @param response from the server to the client with all Categories by CategoryID or an error message
 * @return  A promise containing the response for the client with the requested information,
 * or null if the information could not be found, set to the data field. **/
export async function getCategoryByCategoryIdController (request: Request, response: Response): Promise<void> {
  try {

    //validate the id coming from the request parameters
    const validationResult = CategorySchema.pick({ id: true }).safeParse(request.params)

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    //grab the id off of the validated request parameters
    const { id } =validationResult.data

    //grab the Category by id
    const data = await selectCategoryByCategoryId(id)

    // return the response to the client with the requested information
    response.json({
      status: 200,
      data,
      message: 'Successfully retrieved category by id.'
    })

  }catch (error: unknown){
    // if an error occurs, return a preformatted response to the client
    console.error(error)
    serverErrorResponse(response, null)
  }
}