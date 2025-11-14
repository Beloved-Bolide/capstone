import { z } from 'zod/v4'


export const UserSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id'),
  email: z.email('Please provide a valid email')
    .max(128, 'Please provide a valid email (max 128 characters)'),
  name: z.string('Please provide a valid name')
    .trim()
    .min(1, 'Please provide a valid name (min 1 characters)')
    .max(32, 'Please provide a valid name (max 32 characters)'),
  notifications: z.boolean('Please provide a valid notifications (true or false)')
})

export type User = z.infer<typeof UserSchema>


export async function getUserById (id: string, authorization: string, cookie: string | null): Promise<User | null> {

  const response = await fetch(`${process.env.REST_API_URL}/user/id/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: null
  })

  if (!response.ok) {
    throw new Error('Failed to get user')
  }

  const user: User = await response.json()

  return user ?? null
}