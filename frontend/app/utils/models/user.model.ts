import {z} from "zod/v4";
import type {Status} from "~/utils/interfaces/Status";
import * as process from "node:process";
import * as console from "node:console";
import {v7 as uuid} from 'uuid'



export const UserSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id'),
  email: z.email('Please provide a valid email')
  .max(128, 'please provide a valid email (max 128 characters)'),
  notifications: z.boolean('please provide a valid notifications (true or false)')
  .parse (true)
})

export type User =  z.infer<typeof UserSchema>

export const SignUpSchema = UserSchema.omit({id:true, notifications: true})
  .extend({
    passwordConfirm:z.string('password confirmation is required')
      .min(8,'password confirm cannot be less than 8 characters')
      .max(32,'profile password'),
    password: z.string('password is required')
      .min(8, 'profile password cannot be less than 8 characters')
      .max(32,'profile password cannot be over 32 characters')
})
  .refine(data => data.password === data.passwordConfirm, {
    message: 'passwords do not match',
    path: ['passwordConfirm']
})
export type SignUp = z.infer<typeof SignUpSchema>

export async function postSignUp (data: SignUp): Promise<Status> {

  const modifiedSignUp = { id: uuid(), ...data, notifications: true }
  const response = await fetch(`${process.env.REST_API_URL}/sign-up`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(modifiedSignUp)
  })

  if (!response.ok) {
    throw new Error('Failed to sign up')
  }

  return await response.json()
}
