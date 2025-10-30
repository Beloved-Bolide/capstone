import {Router} from 'express'
import {signupUserController} from './signup.controller.ts'
import {activationController} from './activation.controller.ts'

// define the base path for the route
const basePath = '/apis/signup' as const

// create a new express router
const router = Router()

// define the route
router.route('/')
  .post(signupUserController)

router.route('/activation/:activation')
  .get(activationController)

// export the router
export const signupRoute = {
  basePath,
  router
}