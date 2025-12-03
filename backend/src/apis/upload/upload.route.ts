import { Router } from 'express'
import multer from 'multer'
import { isLoggedInController } from '../../utils/controllers/is-logged-in.controller.ts'
import { postUploadController } from './upload.controller.ts'

const basePath = '/apis/upload' as const
const router = Router()

// Configure Multer to use memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

// Upload route with authentication and file handling
router.route('/')
  .post(isLoggedInController, upload.single('file'), postUploadController)

export const uploadRoute = { basePath, router }
