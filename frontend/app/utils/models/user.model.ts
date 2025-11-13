import { z } from "zod/v4"


export const UserSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id'),
  email: z.email('Please provide a valid email')
    .max(128, 'please provide a valid email (max 128 characters)'),
  notifications: z.boolean('please provide a valid notifications (true or false)')
    .parse(true),
  name: z.string('Please provide a valid name')
    .trim()
    .min(1, 'please provide a valid name(min 1 characters)')
    .max(32, 'please provide a valid name(max 32 characters)'),
})

export type User = z.infer<typeof UserSchema>