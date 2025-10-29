import type {Request, Response} from "express";
import Mailgun from "mailgun.js";
import formData from "form-data";
import {type PrivateUser, insertUser} from "../user/user.model.ts";
import {SignUpUserSchema} from "./signup.schema.ts";
import {zodErrorResponse} from "../../utils/response.utils.ts";
import {setActivationToken, setHash} from "../../utils/auth.utils";

export async function signUpUserController(request: Request, response: Response) {
  try {
    const validationResult = SignUpUserSchema.safeParse(request.body)
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    const {name, email, password, id} = validationResult.data
    const hash = await setHash(password)
    const activationToken = setActivationToken()
    const user: PrivateUser = {
      id: id,
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
      <h2>Welcome to FileWise.</h2>
      <p>In order to start storing your documents you must confirm your account.</p>
      <p><a href="${basePath}">${basePath}</a></p>
    `

    const mailgunMessage = {
      from: `Mailgun Sandbox <postmaster@${process.env.MAILGUN_DOMAIN as string}>`,
      to: email,
      subject: 'Please confirm your filewise account -- Account Activation',
      html: message
    }

    await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN as string, mailgunMessage)

    const status: Status = {
      status: 200,
      message: 'Profile successfully created please check your email.',
      data: null
    }

    response.status(200).json(status)

  } catch (error: any) {
    const status: Status = {
      status: 500,
      message: error.message,
      data: null
    }
    response.status(200).json(status)
  }
}