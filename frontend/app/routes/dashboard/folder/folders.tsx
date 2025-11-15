import type { Route } from './+types/folders'
import type { Folder } from '~/utils/models/folder.model'
import { getFoldersByUserId } from '~/utils/models/folder.model'


export function loader ({ request }: Route.LoaderArgs) {



}

export default function  () {

  // const folders: Folder[] = getFoldersByUserId()

  return (
    <>

    </>
  )
}