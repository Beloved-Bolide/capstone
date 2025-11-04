import { Router } from 'express'
import {
  getFolderByFolderIdController, getFolderByFolderNameController,
  getFolderByUserIdController,
  postFolderController,
  updateFolderController
} from './folder.controller.ts'
import { isLoggedInController } from "../../utils/controllers/is-logged-in.controller.ts";

const basePath = '/apis/folder' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postFolderController)

router.route('/folderId/:id')
  .put(isLoggedInController, updateFolderController)
  .get(isLoggedInController, getFolderByFolderIdController)

router.route('/folderName/:name')
  .get(isLoggedInController, getFolderByFolderNameController)

router.route('/user/:userId')
  .get(isLoggedInController, getFolderByUserIdController)

export const folderRoute = { basePath, router }