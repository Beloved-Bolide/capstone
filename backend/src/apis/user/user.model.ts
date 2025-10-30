import {z} from 'zod/v4'
import {sql} from '../../utils/database.utils.ts'

/**
 * Schema for validating private user objects
 * @shape id: string the primary key for the user
 * @shape about: string | null the about section for the user
 * @shape activationToken: string | null the activation token for the user
 * @shape email: string the email for the user
 * @shape hash: string the password hash for the user
 * @shape imageUrl: string  the image URL for the user
 * @shape name: string the name for the user
 */
// define the schema for a user
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

// define the type for a user
export type PrivateUser = z.infer<typeof PrivateUserSchema>

// define a function to insert a user into the database
export async function insertUser (user: PrivateUser): Promise<string> {

  PrivateUserSchema.parse(user)
  const {id, activationToken, email, hash, name, notifications} = user
  await sql`INSERT INTO "user"(id, activation_token, email, hash, name, notifications)
            VALUES (${id}, ${activationToken}, ${email}, ${hash}, ${name}, ${notifications})`
  return 'User successfully created!'
}

/**
* Selects a profile from the profile table by activationToken
* @param activationToken the profile's activation token to search for in the profile table
* @returns Profile or null if no profile was found
**/
export async function selectPrivateUserByUserActivationToken (activationToken: string): Promise<PrivateUser|null> {

  const rowList = await sql `SELECT id, activation_token, email, hash, name, notifications 
                                            FROM "user" 
                                            WHERE activation_token = ${activationToken}`
  const result = PrivateUserSchema.array().max(1).parse(rowList)
  return result[0] ?? null
}

export async function updateUser (user:PrivateUser): Promise<string> {

  const {id, activationToken, email, hash, name, notifications} = user
  await sql `UPDATE "user" 
             SET activation_token = ${activationToken}, email = ${email}, hash = ${hash}, name = ${name}, notifications = ${notifications}`
  return 'User successfully updated!'
}