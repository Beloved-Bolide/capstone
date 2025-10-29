import {z} from "zod/v4";
import {sql} from "../../utils/database.utils.ts";

export const PrivateUserSchema = z.object({
  id: z
    .uuidv7('Please provide a valid uuid for id'),
  activationToken: z
    .string('Please provide a valid activation token')
    .length(32, 'profile activation token must be 32')
    .nullable(),
  email: z
    .email('Please provide a valid email')
    .max(128, 'please provide a valid email (max 128 characters)'),
  notifications: z
    .boolean('please provide a valid notifications (true or false)'),
  name: z
    .string('Please provide a valid name')
    .trim()
    .min(1, 'please provide a valid name(min 1 characters)')
    .max(32, 'please provide a valid name(max 32 characters)'),
  hash: z
    .string('Please provide a valid hash')
    .length(97, {message: 'please provide a valid hash (max 97 characters)'}),
})

export type PrivateUser = z.infer<typeof PrivateUserSchema>

export async function insertUser(user: PrivateUser): Promise<string> {
  PrivateUserSchema.parse(user)

  const {id, activationToken, email, notifications, name, hash} = user
  await sql`INSERT INTO "user"(id, activation_token, email, hash, name, notifications)
            VALUES (${id}, ${activationToken}, ${email}, ${hash}, ${name}, ${notifications})`
  return 'User successfully created!'
}