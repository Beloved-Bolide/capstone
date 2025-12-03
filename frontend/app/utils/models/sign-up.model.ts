import { z } from 'zod/v4'
import type { Status } from '~/utils/interfaces/Status'
import { v7 as uuid } from 'uuid'
import { UserSchema } from '~/utils/models/user.model'


export const SignUpSchema = UserSchema.omit({ id: true, notifications: true })
  .extend({
    password: z.string('Password is required')
      .min(8, 'User password cannot be less than 8 characters')
      .max(32, 'User password cannot be over 32 characters'),
    passwordConfirm: z.string('Password confirmation is required')
      .min(8, 'Password confirm cannot be less than 8 characters')
      .max(32, 'User password')
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm']
  })

export type SignUp = z.infer<typeof SignUpSchema>


export async function postSignUp (data: SignUp): Promise<Status> {

  const modifiedSignUp = { id: uuid(), ...data, notifications: true }
  const response = await fetch(`${import.meta.env.VITE_REST_API_URL}/sign-up`, {
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