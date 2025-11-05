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

    // NEEDS WORK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
    //     message: 'Forbidden: You cannot create a folder for another user.'
    //   })
    //   return
    // }

    // insert the new category data into the database
    const insertedCategory = await insertCategory(validationResult.data)

    // create a preformatted response to the client
    const status: Status = {
      status: 200,
      data: null,
      message: insertedCategory
    }

    // return the success response to the client
    response.json({
      status: 200,
      data: null,
      message: insertedCategory
    })

  } catch (error: any) {
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

    // validate the category id coming from the request parameters
    const validationResultForRequestParams = CategorySchema.pick({ id: true }).safeParse({ id: request.params.id })
    // if the validation of the params is unsuccessful, return a preformatted response to the client
    if (!validationResultForRequestParams.success) {
      zodErrorResponse(response, validationResultForRequestParams.error)
      return
    }

    // validate the category data coming from the request body
    const validationResultForRequestBody = CategorySchema.safeParse(request.body)
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResultForRequestBody.success) {
      zodErrorResponse(response, validationResultForRequestBody.error)
      return
    }

    // grab the category id from the validated request parameters
    const { id } = validationResultForRequestParams.data
    // grab the category by id
    const category: Category | null = await selectCategoryByCategoryId(id)
    // if the category does not exist, return a preformatted response to the client
    if (category === null) {
      response.json({
        status: 404,
        data: null,
        message: 'Category not found.'
      })
      return
    }

    // NEEDS WORK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // // grab the user id from the session
    // const userFromSession = request.session?.user
    // const userIdFromSession = userFromSession?.id
    // // if the user is not authorized to update the category, return a preformatted response to the client
    // if (userIdFromSession !== category.userId) {
    //   response.json({
    //     status: 403,
    //     data: null,
    //     message: 'Forbidden: You do not own this category.'
    //   })
    // }

    // grab the category data from the validated request body
    const { color, icon, name } = validationResultForRequestBody.data
    // update the category with the new data
    category.color = color
    category.icon = icon
    category.name = name

    // update the category in the database
    await updateCategory(category)

    // if the category update was successful, return a preformatted response to the client
    response.json({
      status: 200,
      data: null,
      message: 'Category successfully updated!'
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

    // validate the id coming from the request parameters
    const validationResult = CategorySchema.pick({ id: true }).safeParse({ id: request.params.id })
    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // grab the id from the validated request parameters
    const { id } = validationResult.data

    // select the category by id
    const selectedCategory = await selectCategoryByCategoryId(id)

    // return the response to the client with the requested information
    response.json({
      status: 200,
      data: selectedCategory,
      message: 'Successfully retrieved category by id.'
    })

  }catch (error: any) {
    console.error(error)
    serverErrorResponse(response, null)
  }
}