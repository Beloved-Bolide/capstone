import { Router } from 'express'
import {
  getCategoryByCategoryIdController,
  postCategoryController,
  updateCategoryController
} from './category.controller.ts'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'


const basePath = '/apis/category' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postCategoryController)

router.route('/id/:id')
  .get(isLoggedInController, getCategoryByCategoryIdController)
  .put(isLoggedInController, updateCategoryController)

export const categoryRoute = { basePath, router }