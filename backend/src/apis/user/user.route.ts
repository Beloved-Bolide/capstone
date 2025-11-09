import {Router} from 'express'
import {isLoggedInController} from '../../utils/controllers/is-logged-in.controller.ts'
import {updateUserController} from './user.controller.ts'


const basePath = '/apis/user' as const
const router = Router()

router.route('/id/:id')
  .put(isLoggedInController, updateUserController)

export const userRoute = {basePath, router}