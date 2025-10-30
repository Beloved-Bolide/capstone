import {Router} from 'express'
import {signinController} from './signin.controller'

// declare a basePath for this router
const basePath = '/apis/signin' as const

// instantiate a new router object
const router = Router()

// define signup route for this router
router.route('/')
  .post(signinController)

// export the router with the basePath and router object
export const signinRoute = { basePath, router }