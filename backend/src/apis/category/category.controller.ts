import type { Request, Response } from 'express'
import { serverErrorResponse, zodErrorResponse } from '../../utils/response.utils.ts'
import { selectCategoryByCategoryId, updateCategory } from './category.model.ts'
import { type Category, CategorySchema, insertCategory, selectCategories } from './category.model.ts'


/** POST new category
 * @endpoint POST /apis/category **/
export async function postCategoryController (request: Request, response: Response): Promise<void> {
  try {

    // parse the new category data from the request body and validate it
    const validationResult = CategorySchema.safeParse(request.body)
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // insert the new category data into the database
    const insertedCategory = await insertCategory(validationResult.data)

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

/** PUT update category
 * @endpoint PUT /apis/category/:id **/
export async function putCategoryController (request: Request, response: Response): Promise<void> {
  try {

    // parse the category id from the request parameters and validate it
    const validatedRequestParams = CategorySchema.pick({ id: true }).safeParse({ id: request.params.id })
    if (!validatedRequestParams.success) {
      zodErrorResponse(response, validatedRequestParams.error)
      return
    }

    // parse the updated category data from the request body and validate it
    const validatedRequestBody = CategorySchema.safeParse(request.body)
    if (!validatedRequestBody.success) {
      zodErrorResponse(response, validatedRequestBody.error)
      return
    }

    // get the category id from the validated request params, get the category, and check if it exists
    const { id } = validatedRequestParams.data
    const category: Category | null = await selectCategoryByCategoryId(id)
    if (!category) {
      response.json({
        status: 404,
        data: null,
        message: 'Category not found.'
      })
      return
    }

    // update the category with the new data
    const { color, icon, name } = validatedRequestBody.data
    category.color = color
    category.icon = icon
    category.name = name

    // update the category in the database
    await updateCategory(category)

    // if the category update was successful, return a 200 response
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

/** GET single category by id
 * @endpoint GET /apis/category/:id **/
export async function getCategoryByCategoryIdController (request: Request, response: Response): Promise<void> {
  try {

    // parse the category id from the request parameters and validate it
    const validationResult = CategorySchema.pick({ id: true }).safeParse({ id: request.params.id })
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // grab the id from the validated request parameters and select the category by id
    const { id } = validationResult.data
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

/** GET all categories
 * @endpoint GET /apis/category **/
export async function getCategoriesController (request: Request, response: Response): Promise<void> {
  try {

    // select all categories
    const categories: Category[] | null = await selectCategories()

    // check if categories were found
    if (!categories) {
      response.json({
        status: 404,
        data: null,
        message: 'No categories found.'
      })
      return
    }

    // return a success response
    response.json({
      status: 200,
      data: categories,
      message: 'Categories successfully got!'
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}