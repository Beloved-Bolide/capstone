import {Router} from 'express'
import {postFolderController, updateFolderController} from './folder.controller.ts'
import {isLoggedInController} from "../../utils/controllers/is-logged-in.controller.ts";

const basePath = '/apis/folder' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postFolderController)

router.route('/:id')
  .patch(isLoggedInController, updateFolderController)

export const folderRoute = { basePath, router }