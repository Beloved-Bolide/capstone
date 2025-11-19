import { Router } from 'express'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'
import {
  getFileByFileIdController,
  getFilesByRecordIdController,
  postFileController,
  updateFileController,
  deleteFileController
} from './file.controller.ts'


const basePath = '/apis/file' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postFileController)

router.route('/id/:id')
  .get(isLoggedInController, getFileByFileIdController)
  .put(isLoggedInController, updateFileController)
  .delete(isLoggedInController, deleteFileController)

router.route('/recordId/:recordId')
  .get(isLoggedInController, getFilesByRecordIdController)

export const fileRoute = { basePath, router }