import type { Route } from './+types/folder'
import { Link } from 'react-router'
import { getFolderByName } from '~/utils/models/folder.model'
import React, { useState } from 'react'
import { FileText } from 'lucide-react'
import { getSession } from '~/utils/session.server'


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

  const folderName: string = 'All Folders'

  const folder = await getFolderByName(folderName, authorization, cookie)

  return { folder }
}

export default function Folder ({ loaderData }: Route.ComponentProps) {

  // const request = useLoaderData<typeof Request>()
  //
  // // get the cookie from the request headers
  // const session = await getSession(request.headers.get('cookie'))
  //
  // // get the cookie, user, and authorization from the session
  // const cookie =  request.headers.get('cookie')
  // const user = session.get('user')
  // const authorization = session.get('authorization')
  //
  // // if the user or authorization is not found, return an error
  // if (!cookie || !user?.id || !authorization) {
  //   return { success: false, status: {
  //       status: 401,
  //       data: null,
  //       message: 'Unauthorized'
  //     }}
  // }

  const { folder } = loaderData
  if (!folder) return <>Folder not found</>

  const folderName = folder?.name

  const [selectedFolder, setSelectedFolder] = useState('All Folders')

  return (
    <div id="folder" className="space-y-1 pl-8">
      <Link
        to="/folder"
        key={folderName}
        onClick={() => setSelectedFolder(folderName)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        selectedFolder === folderName
        ? 'bg-blue-50 text-blue-700 border border-blue-200'
        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
        }`}
        >
          <label htmlFor="folder" className="block mb-2 text-sm font-medium text-gray-700">
            <FileText className="w-4 h-4"/>
          </label>
          <span className="flex-1 text-left">{ folderName }</span>
      </Link>
    </div>
  )
}

