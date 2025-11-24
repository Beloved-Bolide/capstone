import type { Route } from './+types/folder'
import { Link } from 'react-router'
import { getFolderByName, getFoldersByUserId } from '~/utils/models/folder.model'
import React, { useState } from 'react'
import { FileText, FolderOpen } from 'lucide-react'
import { getSession } from '~/utils/session.server'
import type { Folder } from '~/utils/models/folder.model'


export async function loader ({ request, params }: Route.LoaderArgs) {

  // get the cookie from the request headers
  const session = await getSession(request.headers.get('cookie'))

  // get the cookie, user, and authorization from the session
  const cookie =  request.headers.get('cookie')
  const user = session.get('user')
  const authorization = session.get('authorization')

  // if the user or authorization is not found, return an error
  if (!cookie || !user?.id || !authorization) {
    return { folder: null }
  }

  // get the folder name from the request query parameters
  const folderName: string = params.toString()

  // get the folders for the current user
  const folders: Folder[] = await getFoldersByUserId(user.id, authorization, cookie)

  // get the files for the selected folder
  // code goes here

  // // get the folder by name from the server
  // const folder: Folder = await getFolderByName(folderName, authorization, cookie)

  // return the folder data
  return { folders }
}

export default function Folder ({ loaderData }: Route.ComponentProps) {

  const { folders } = loaderData
  if (!folders) return <></>

  // destructure the folder data from the loaderData object
  const { folder } = loaderData
  if (!folder) return <>Folder not found</>

  // // get the folder name from the folder object
  // const folderName = folder?.name

  // state to store the selected folder
  const [selectedFolder, setSelectedFolder] = useState('All Folders')

  return (
  <div>
    {folders.map((folder) => (
    <div key={folder.id}>
      <Link
      to={`./${folder.id}`}
      onClick={() => setSelectedFolder(folder.name)}
      className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      selectedFolder === folder.name
      ? 'bg-blue-50 text-blue-700 border border-blue-200'
      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
      }`}
      >
        <FolderOpen className="w-4 h-4"/>
        <span className="flex-1 text-left">{folder.name}</span>
      </Link>
    </div>
    ))}
  </div>
  )
}