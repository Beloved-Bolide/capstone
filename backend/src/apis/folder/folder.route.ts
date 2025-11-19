import { Router } from 'express'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'
import {
  getFolderByFolderIdController,
  getFolderByFolderNameController,
  getFoldersByParentFolderIdController,
  getFoldersByUserIdController,
  postFolderController,
  putFolderController,
  deleteFolderController
} from './folder.controller.ts'


const basePath = '/apis/folder' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postFolderController)

router.route('/id/:id')
  .get(isLoggedInController, getFolderByFolderIdController)
  .put(isLoggedInController, putFolderController)
  .delete(isLoggedInController, deleteFolderController)

router.route('/parentFolderId/:parentFolderId')
  .get(isLoggedInController, getFoldersByParentFolderIdController)

router.route('/userId/:userId')
  .get(isLoggedInController, getFoldersByUserIdController)

router.route('/name/:name')
  .get(isLoggedInController, getFolderByFolderNameController)

export const folderRoute = { basePath, router }