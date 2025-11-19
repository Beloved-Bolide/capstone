import { Router } from 'express'
import {
  getFileByFileIdController,
  getFileByRecordIdController,
  postFileController,
  updateFileController
} from './file.controller.ts'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'


const basePath = '/apis/file' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postFileController)

router.route('/id/:id')
  .get(isLoggedInController, getFileByFileIdController)
  .put(isLoggedInController, updateFileController)

router.route('/record/:id')
  .get(isLoggedInController, getFileByRecordIdController)

export const fileRoute = { basePath, router }