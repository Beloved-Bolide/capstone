import {Router} from 'express'
import {postFolderController} from './folder.controller.ts'
import {isLoggedInController} from "../../utils/controllers/is-logged-in.controller.ts";

const basepath = '/apis/folder' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postFolderController)

export const folderRoute = { basepath, router }