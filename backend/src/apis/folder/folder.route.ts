import {Router} from 'express'
import {
  getFolderByFolderIdController,
  getFolderByUserIdController,
  postFolderController,
  updateFolderController
} from './folder.controller.ts'
import {isLoggedInController} from "../../utils/controllers/is-logged-in.controller.ts";

const basePath = '/apis/folder' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postFolderController)

router.route('/:id')
  .patch(isLoggedInController, updateFolderController)

router.route('/:userId')
.get(isLoggedInController, getFolderByUserIdController)

router.route('/:folderId')
.get(isLoggedInController, getFolderByFolderIdController)

export const folderRoute = { basePath, router }