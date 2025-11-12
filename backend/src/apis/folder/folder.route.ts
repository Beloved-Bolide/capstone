import { Router } from 'express'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'
import {
  postFolderController,
  updateFolderController,
  getFolderByFolderIdController,
  getFolderByFolderNameController,
  getFoldersByParentFolderIdController,
  getFoldersByUserIdController
} from './folder.controller.ts'


const basePath = '/apis/folder' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postFolderController)

router.route('/id/:id')
  .get(isLoggedInController, getFolderByFolderIdController)
  .put(isLoggedInController, updateFolderController)

router.route('/parentFolderId/:parentFolderId')
.get(isLoggedInController, getFoldersByParentFolderIdController)

router.route('/userId/:id')
  .get(isLoggedInController, getFoldersByUserIdController)

router.route('/name/:name')
.get(isLoggedInController, getFolderByFolderNameController)

export const folderRoute = { basePath, router }