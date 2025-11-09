import { Router } from 'express'
import {
  getFolderByFolderIdController,
  getFolderByFolderNameController, getFolderByParentFolderIdController,
  getFoldersByUserIdController,
  postFolderController,
  updateFolderController
} from './folder.controller.ts'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'


const basePath = '/apis/folder' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postFolderController)

router.route('/id/:id')
  .get(isLoggedInController, getFolderByFolderIdController)
  .put(isLoggedInController, updateFolderController)

router.route('/name/:name')
  .get(isLoggedInController, getFolderByFolderNameController)

router.route('/user/id/:id')
  .get(isLoggedInController, getFoldersByUserIdController)

router.route('/parent/:parentFolderId')
  .get(isLoggedInController, getFolderByParentFolderIdController)

export const folderRoute = { basePath, router }