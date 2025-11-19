import { Router } from 'express'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'
import {
  postFileController,
  updateFileController,
  getFileByFileIdController,
  getFilesByRecordIdController
} from './file.controller.ts'


const basePath = '/apis/file' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postFileController)

router.route('/:id')
  .put(isLoggedInController, updateFileController)
  .get(isLoggedInController, getFileByFileIdController)

router.route('/:recordId')
  .get(isLoggedInController, getFilesByRecordIdController)

export const fileRoute = { basePath, router }