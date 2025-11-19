import {z} from "zod/v4";
import type {Status} from "~/utils/interfaces/Status";
import type {Folder} from "~/utils/models/folder.model";


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
export type Category = z.infer<typeof CategorySchema>


export async function postCategory (data: Category, authorization: string, cookie: string | null): Promise<{ result: Status, headers: Headers }> {

  const response = await fetch(`${process.env.REST_API_URL}/category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Cookie': cookie ?? ''
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error('Failed to create new category')
  }

  const headers = response.headers
  const result = await response.json()
  return { headers, result }
}

export async function getCategories ():Promise<Category[]> {

  const response = await fetch(`${process.env.REST_API_URL}/category`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': authorization,
      // 'Cookie': cookie?? ''
    },
    body: null
  })

  if(!response.ok){
    throw new Error('Failed to get categories')
  }

  const { data } = await response.json()

  return data
}
