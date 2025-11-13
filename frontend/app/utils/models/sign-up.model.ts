import { z } from 'zod/v4'
import type { Status } from '~/utils/interfaces/Status'
import { v7 as uuid } from 'uuid'
import process from 'node:process'
import { UserSchema } from '~/utils/models/user.model'


export const SignUpSchema = UserSchema.omit({ id: true, notifications: true })
  .extend({
    password: z.string('password is required')
      .min(8, 'profile password cannot be less than 8 characters')
      .max(32, 'profile password cannot be over 32 characters'),
    passwordConfirm: z.string('password confirmation is required')
      .min(8, 'password confirm cannot be less than 8 characters')
      .max(32, 'profile password')
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