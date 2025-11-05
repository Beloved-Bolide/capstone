import { Router } from 'express'
import { signUpUserController } from './sign-up.controller.ts'
import { activationController } from './activation.controller.ts'


// define the base path for the route
const basePath = '/apis/sign-up' as const

// create a new express router
const router = Router()

// define the route
router.route('/')
  .post(signUpUserController)

router.route('/activation/:activation')
  .get(activationController)

// export the router
export const signUpRoute = { basePath, router }