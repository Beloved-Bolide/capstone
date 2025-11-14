import type { Route } from './+types/edit-folder'


export async function loader ({ params }: Route.LoaderArgs) {
  const folder = await getFolder(params.id)
  if (!folder) {
    throw new Response("Not Found", { status: 404 })
  }
  return { folder }
}

export default function EditFolder ({ loaderData }: Route.LoaderArgs) {

}