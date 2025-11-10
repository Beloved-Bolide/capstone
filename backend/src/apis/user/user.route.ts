import {Router} from 'express'
import {isLoggedInController} from '../../utils/controllers/is-logged-in.controller.ts'
import {getUserByUserIdController, updateUserController} from './user.controller.ts'


const basePath = '/apis/user' as const
const router = Router()

router.route('id/:id')
  .put(isLoggedInController, updateUserController)
  .get(isLoggedInController,getUserByUserIdController)

export const userRoute = {basePath, router}