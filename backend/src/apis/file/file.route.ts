import { Router } from 'express'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'
import {
  getFileByFileIdController,
  getFilesByRecordIdController,
  postFileController,
  updateFileController
} from './file.controller.ts'


const basePath = '/apis/file' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postFileController)

router.route('/:id')
  .get(isLoggedInController, getFileByFileIdController)
  .put(isLoggedInController, updateFileController)

router.route('/:recordId')
  .get(isLoggedInController, getFilesByRecordIdController)

export const fileRoute = { basePath, router }