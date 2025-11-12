import { Router } from 'express'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'
import {
  getRecordsByCategoryIdController,
  getRecordsByFolderIdController,
  getRecordByRecordIdController,
  postRecordController,
  updateRecordController
} from './record.controller.ts'


const basePath = '/apis/record' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postRecordController)

router.route('/id/:id')
  .get(isLoggedInController, getRecordByRecordIdController)
  .put(isLoggedInController, updateRecordController)

router.route('/folderId/:folderId')
  .get(isLoggedInController, getRecordsByFolderIdController)

router.route('/categoryId/:categoryId')
  .get(isLoggedInController, getRecordsByCategoryIdController)

export const recordRoute = { basePath, router }