import type { Request, Response } from 'express'
import {
  type Category,
  CategorySchema, insertCategory
} from './category.model.ts'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import { selectCategoryByCategoryId, updateCategory } from './category.model.ts'
import type { Status } from '../../utils/interfaces/Status.ts'


/** Express controller for creating a new category
 * @endpoint POST /apis/category
 * @param request an object containing the body with category data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the category creation was successful **/
export async function postCategoryController (request: Request, response: Response): Promise<void> {
  try {

    // validate the new user data coming from the request body
    const validationResult = CategorySchema.safeParse(request.body)

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // check if the user is authenticated
    const user = request.session?.user
    if (!user) {
      response.json({
        status: 401,
        data: null,
        message: 'Please login to create a category.'
      })
    }
    // insert the new category data into the database
    const message = await insertCategory(validationResult.data)

    // create a preformatted response to the client
    const status: Status = {
      status: 200,
      data: null,
      message: message
    }

    // return the response to the client
    response.json(status)

  } catch (error: any) {

    //catch any errors that occurred during the update process and return a response to the client
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for updating a category
 * @endpoint PUT /apis/category/:id
 * @param request an object containing the body with category data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the category update was successful **/
export async function updateCategoryController (request: Request, response: Response): Promise<void> {
  try {

    // validate the category data coming from the request body
    const validationResult = CategorySchema.safeParse(request.body)

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // check if the user is authenticated
    const user = request.session?.user
    if (!user) {
      response.json({
        status: 401,
        data: null,
        message: 'Please login to update a category.'
      })
      return
    }

    // get the category
    const category = await selectCategoryByCategoryId(validationResult.data.id)
    if (category === null) {
      response.json({
        status: 404,
        data: null,
        message: 'Category not found.'
      })
      return
    }

    // update the category
    await updateCategory(validationResult.data)

    // if the category update was successful, return a preformatted response to the client
    response.json({
      status: 200,
      data: null,
      message: 'Category successfully updated.'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/** Express controller for getting the Category by id
 * @param request from the client to the server to get all Categories by CategoryID
 * @param response from the server to the client with all Categories by CategoryID or an error message
 * @return A promise containing the response for the client with the requested information,
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