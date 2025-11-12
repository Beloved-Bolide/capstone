import { Router } from 'express'
import {
  getFolderByFolderIdController,
  getFolderByFolderNameController, getFoldersByParentFolderIdController,
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

router.route('/userId/:id')
  .get(isLoggedInController, getFoldersByUserIdController)

router.route('/parentFolderId/:parentFolderId')
  .get(isLoggedInController, getFoldersByParentFolderIdController)

export const folderRoute = { basePath, router }