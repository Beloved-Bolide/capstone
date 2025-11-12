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
  getRecordByNameController,
  searchRecordsController,
  deleteRecordController
} from './record.controller.ts'


const basePath = '/apis/record' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postRecordController)

router.route('/id/:id')
  .get(isLoggedInController, getRecordByRecordIdController)
  .put(isLoggedInController, updateRecordController)
  .delete(isLoggedInController, deleteRecordController)

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

/** GET /apis/record/search?q=searchTerm&limit=50
 * search records (query parameter 'q' is required) **/
router.route('/search')
  .get(isLoggedInController, searchRecordsController)

export const recordRoute = { basePath, router }