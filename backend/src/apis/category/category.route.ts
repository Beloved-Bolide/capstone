import { Router } from 'express'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'
import {
  getCategoriesController,
  getCategoryByCategoryIdController,
  postCategoryController,
  putCategoryController,
  deleteCategoryController
} from './category.controller.ts'


const basePath = '/apis/category' as const
const router = Router()

router.route('/')
  .get( getCategoriesController)
  .post(isLoggedInController, postCategoryController)

router.route('/id/:id')
  .get(isLoggedInController, getCategoryByCategoryIdController)
  .put(isLoggedInController, putCategoryController)
  .delete(isLoggedInController, deleteCategoryController)

export const categoryRoute = { basePath, router }