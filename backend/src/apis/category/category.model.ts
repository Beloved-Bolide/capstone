import { z } from 'zod/v4'
import {sql} from "../../utils/database.utils.ts";


/**
 * selects the Category from the Category table by id
 * @param id the Category's id to search for in the Category table
 * @returns Category or null if no Category was found
 **/



export async function selectCategoryByCategoryId (id:string): Promise<Category |null> {

  // create a prepared statement that selects the profile by id and execute the statement
  const rowList = await sql`SELECT id,color,icon,name FROM category WHERE id =${id}`

  // enforce that the result is an array of one category, or null
  const result = CategorySchema.array().max(1).parse(rowList)

  // return the Category or null if no Category was found
  return result[0] ?? null
}
