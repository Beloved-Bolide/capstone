import type { Request, Response } from 'express'
import type { Status } from '../../utils/interfaces/Status.ts'
import Mailgun from 'mailgun.js'
import formData from 'form-data'
import { SignUpUserSchema } from './sign-up.schema.ts'
import { type PrivateUser, insertUser } from '../user/user.model.ts'
import { zodErrorResponse } from '../../utils/response.utils.ts'
import { setActivationToken, setHash } from '../../utils/auth.utils'
import {sql} from "../../utils/database.utils.ts";
import { v7 as uuid } from 'uuid'
import {getFolderByFolderIdController, getFoldersByUserIdController} from "../folder/folder.controller.ts";
import {type Folder, selectFoldersByUserId} from "../folder/folder.model.ts";


export async function signUpUserController (request: Request, response: Response) {
  try {

    // validate the new user's data
    const validationResult = SignUpUserSchema.safeParse(request.body)
    // if validation fails, return an error response
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }

    // if validation succeeds, create a new user
    const { id, email, name, password } = validationResult.data
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

    // prepare and send activation email to a new user
    const mailGun: Mailgun = new Mailgun(formData)
    const mailgunClient = mailGun.client({ username: 'api', key: process.env.MAILGUN_API_KEY as string })
    const basePath: string = `${request.protocol}://${request.hostname}:8080${request.originalUrl}/activation/${activationToken}`
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

    await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${id}, ${'All Folders'})`

    await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${id}, ${'Starred'})`

    await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${id}, ${'Recent'})`

    await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${id}, ${'Expiring'})`

    await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${null}, ${id}, ${'Trash'})`

    const folders: Folder[] | null = await selectFoldersByUserId(id)
    if(!folders) {
      return
    }
    // @ts-ignore
    const parent: string = folders[0]?.parentFolderId


    await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${parent}, ${id}, ${'Receipts'})`

    await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${parent}, ${id}, ${'Warranties'})`

    await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${parent}, ${id}, ${'Manuals'})`

    await sql `
    INSERT INTO folder(id, parent_folder_id, user_id, name)
    VALUES (${uuid()}, ${parent}, ${id}, ${'Coupons'})`



    // create a status message
    const status: Status = {
      status: 200,
      message: 'User successfully created! Please check your email.',
      data: null
    }

    // return a success response
    response.status(200).json(status)

  } catch (error: any) {
    // create a status message
    const status: Status = {
      status: 500,
      message: error.message,
      data: null
    }
    // return a server error response
    response.status(200).json(status)
  }
}