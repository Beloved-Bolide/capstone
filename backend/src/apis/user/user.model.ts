import {z} from 'zod/v4'
import {sql} from '../../utils/database.utils.ts'

/**
 * Schema for validating private user objects
 * @shape id: string the primary key for the user
 * @shape activationToken: string | null the activation token for the user
 * @shape email: string the email for the user
 * @shape hash: string the password hash for the user
 * @shape name: string the name for the user
 * @shape notifications: boolean the notifications for the user
 */

export const PrivateUserSchema = z.object({
  id: z
    .uuidv7('Please provide a valid uuid for id'),
  activationToken: z
    .string('Please provide a valid activation token')
    .length(32, 'user activation token must be 32')
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

/**
 * Schema for validating public user objects
 * @shape id: string the primary key for the user
 * @shape about: string | null the about section for the user
 * @shape imageUrl: string | null the image URL for the user
 * @shape name: string the name for the user
 */

export const PublicUserSchema = PrivateUserSchema.omit({hash: true, activationToken: true, email: true})

/**
 * this type is used to represent a private user object
 * @shape id: string the primary key for the user
 * @shape activationToken: string | null the activation token for the user
 * @shape email: string the email for the user
 * @shape hash: string the password hash for the user
 * @shape name: string the name for the user
 * @shape notifications: boolean the notifications for the user
 */

export type PrivateUser = z.infer<typeof PrivateUserSchema>

/**
 * this type is used to represent a public user object
 * @shape id: string the primary key for the user
 * @shape about: string | null the about section for the user
 * @shape imageUrl: string the image URL for the user
 * @shape name: string the name for the user
 **/

export type PublicUser = z.infer<typeof PublicUserSchema>

/**
 * Inserts a new user into the user table
 * @param user the user to insert
 * @returns "user successfully created"
 */

export async function insertUser (user: PrivateUser): Promise<string> {
  // validate the user object against the PrivateUserSchema
  PrivateUserSchema.parse(user)
  const {id, activationToken, email, hash, name, notifications} = user
  await sql`INSERT INTO "user" (id, activation_token, email, hash, name, notifications)
            VALUES (${id}, ${activationToken}, ${email}, ${hash}, ${name}, ${notifications})`
  return 'User successfully created!'
}

/**
 * updates a user in the user table
 * @param user
 * @returns {Promise<string>} 'user successfully updated'
 */

export async function updateUser (user: PrivateUser): Promise<string> {
  const {id, activationToken, email, hash, name, notifications} = user
  await sql `
    UPDATE "user" 
    SET
      activation_token = ${activationToken},
      email = ${email},
      hash = ${hash},
      name = ${name},
      notifications = ${notifications}`
  return 'User successfully updated!'
}

/**
* Selects a user from the user table by activationToken
* @param activationToken the user's activation token to search for in the user table
* @returns user or null if no user was found
*/

export async function selectPrivateUserByUserActivationToken (activationToken: string): Promise<PrivateUser|null> {
  const rowList = await sql `
    SELECT 
      id,
      activation_token,
      email,
      hash,
      name,
      notifications 
    FROM "user" 
    WHERE activation_token = ${activationToken}`
  const result = PrivateUserSchema.array().max(1).parse(rowList)
  return result[0] ?? null
}

/**
 * Selects the private user from the user table by email
 * @param email  the user's email to search for in the user table
 * @returns user or null if no user was found
 */

export async function selectPrivateUserByUserEmail (email: string): Promise<PrivateUser|null> {
  // create a prepared statement that selects the user by email and execute the statement
  const rowList = await sql `
    SELECT
      id,
      activation_token,
      email,
      hash,
      name,
      notifications
    FROM "user"
    WHERE
      email = ${email}`
  // enforce that the result is an array of one user, or null
  const result = PrivateUserSchema.array().max(1).parse(rowList)
  // return the user or null if no user was found
  return result[0] ?? null
}

/**
 * selects the PrivateUser from the user table by id
 * @param id the user's id to search for in the user table
 * @returns PrivateUser or null if no user was found
 */

export async function selectPrivateUserByUserId(id: string): Promise<PrivateUser | null> {
  // create a prepared statement that selects the user by id and execute the statement
  const rowList = await sql`
    SELECT 
      id, 
      activation_token,
      email, 
      hash, 
      name, 
      notifications 
    FROM "user" 
    WHERE id = ${id}`

  // enforce that the result is an array of one user, or null
  const result = PrivateUserSchema.array().max(1).parse(rowList)

  // return the profile or null if no profile was found
  return result[0] ?? null

}


