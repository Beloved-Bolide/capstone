import { SignUpSchema } from '~/utils/models/sign-up.model'
import { z } from 'zod/v4'
import type { Status } from '~/utils/interfaces/Status'
import process from 'node:process'


export const SignInSchema = SignUpSchema.pick({ email: true, password: true })

export type SignIn = z.infer<typeof SignInSchema>


export async function postSignIn (data: SignIn): Promise<{ result: Status, headers: Headers }> {

  const response = await fetch(`${process.env.REST_API_URL}/sign-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error('Failed to sign in')
  }

  const headers = response.headers
  const result = await response.json()
  return { result, headers }
}