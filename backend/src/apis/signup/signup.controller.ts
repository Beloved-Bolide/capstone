import type {Request, Response} from 'express'
import Mailgun from 'mailgun.js'
import formData from 'form-data'
import {SignUpUserSchema} from './signup.schema.ts'
import {type PrivateUser, insertUser} from '../user/user.model.ts'
import {zodErrorResponse} from '../../utils/response.utils.ts'
import {setHash, setActivationToken} from '../../utils/auth.utils'
import type {Status} from '../../utils/interfaces/Status.ts'

export async function signupUserController(request: Request, response: Response) {
  try {
    // validate the new user's data
    const validationResult = SignUpUserSchema.safeParse(request.body)
    // if validation fails, return an error response
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // if validation succeeds, create a new user
    const {id, email, name, password} = validationResult.data
    const hash = await setHash(password)
    const activationToken = setActivationToken()
    const user: PrivateUser = {
      id,
      activationToken,
      email,
      notifications: true,
      hash,
      name
    }
    await insertUser(user)

    // prepare and send activation email to new user
    const mailGun: Mailgun = new Mailgun(formData)
    const mailgunClient = mailGun.client({username: 'api', key: process.env.MAILGUN_API_KEY as string})
    const basePath: string = `${request.protocol}://${request.hostname}:8080${request.originalUrl}activation/${activationToken}`
    const message = `
      <h2>Welcome to FileWise!</h2>
      <p>To start storing your documents, you must confirm your account.</p>
      <p><a href="${basePath}">${basePath}</a></p>`
    const mailgunMessage = {
      from: `Mailgun Sandbox <postmaster@${process.env.MAILGUN_DOMAIN as string}>`,
      to: email,
      subject: 'Please confirm your Filewise account -- Account Activation',
      html: message
    }
    await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN as string, mailgunMessage)

    const status: Status = { // create a status message
      status: 200,
      message: 'Profile successfully created! Please check your email.',
      data: null
    }

    response.status(200).json(status) // return a success response

  } catch (error: any) {
    const status: Status = { // create a status message
      status: 500,
      message: error.message,
      data: null
    }
    response.status(200).json(status) // return a server error response
  }
}