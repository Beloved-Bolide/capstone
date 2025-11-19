import { Router } from 'express'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'
import {
  getCategoriesController,
  getCategoryByCategoryIdController,
  postCategoryController,
  putCategoryController
} from './category.controller.ts'


const basePath = '/apis/category' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postCategoryController)
  .get(isLoggedInController, getCategoriesController)

router.route('/id/:id')
  .get(isLoggedInController, getCategoryByCategoryIdController)
  .put(isLoggedInController, putCategoryController)

export const categoryRoute = { basePath, router }