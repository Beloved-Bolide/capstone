import {Router} from 'express'
import {signInController} from './sign-in.controller.ts'

// declare a basePath for this router
const basePath = '/apis/sign-in' as const

// instantiate a new router object
const router = Router()

// define a sign-in route for this router
router.route('/')
  .post(signInController)

// export the router with the basePath and router object
export const signInRoute = { basePath, router }