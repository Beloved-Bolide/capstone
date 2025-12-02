import { Router } from 'express'
import { postUploadUrlController } from './upload-url.controller.ts'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'


const router = Router()
const basePath = '/apis/upload-url'

router.route('/')
  .post(isLoggedInController, postUploadUrlController)

export const uploadUrlRoute = { basePath, router }