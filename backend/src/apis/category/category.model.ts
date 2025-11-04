import { z } from 'zod/v4'
import { sql } from "../../utils/database.utils.ts";

/** schema for validating private category objects
 * @shape id: string the primary key for the category
 * @shape color: string the color for the category
 * @shape icon: string the icon for the category
 * @shape name: string the name for the category **/
export const CategorySchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id.'),
  color: z.string('Please provide a valid color.')
    .trim()
    .min(1, 'You need a minimum of 1 characters for the color.')
    .max(32, 'You need a maximum of 32 characters for the color.'),
  icon: z.string('Please provide a valid icon.')
    .trim()
    .min(1, 'You need a minimum of 1 characters for the icon.')
    .max(128, 'You need a maximum of 128 characters for the icon.'),
  name: z.string('Please provide a valid name.')
    .trim()
    .min(1, 'You need a minimum of 1 characters for the name.')
    .max(32, 'You need a maximum of 32 characters for the name.')
})

/** this type is used to represent a category object
 * @shape id: string the primary key for the category
 * @shape color: string the color for the category
 * @shape icon: string the icon for the category
 * @shape name: string the name for the category **/
export type Category = z.infer<typeof CategorySchema>

/** selects the Category from the Category table by id
 * @param id the Category's id to search for in the Category table
 * @returns Category or null if no Category was found **/
export async function selectCategoryByCategoryId (id: string): Promise<Category | null> {

  // create a prepared statement that selects the profile by id and execute the statement
  const rowList = await sql`
    SELECT 
      id,
      color,
      icon,
      name 
    FROM category 
    WHERE id = ${id}`

  // enforce that the result is an array of one category, or null
  const result = CategorySchema.array().max(1).parse(rowList)

  // return the Category or null if no Category was found
  return result[0] ?? null
}
