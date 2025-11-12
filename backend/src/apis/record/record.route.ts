import { Router } from 'express'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'
import {
  postRecordController,
  updateRecordController,
  getRecordsByFolderIdController,
  getRecordByRecordIdController,
  getRecordsByCategoryIdController,
  getRecordsByCompanyNameController,
  getRecordsByLastAccessedAtController,
  getRecordByNameController
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

router.route('/companyName/:companyName')
  .get(isLoggedInController, getRecordsByCompanyNameController)

router.route('/lastAccessedAt/:lastAccessedAt')
  .get(isLoggedInController, getRecordsByLastAccessedAtController)

router.route('/name/:name')
  .get(isLoggedInController, getRecordByNameController)

export const recordRoute = { basePath, router }