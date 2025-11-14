import type { Route } from './+types/folder'
import { Link, Outlet, useLoaderData } from 'react-router'
import { getFolderById } from '~/utils/models/folder.model'
import React, { useState } from 'react'
import { FileText } from 'lucide-react'
import { getSession } from '~/utils/session.server'
import { useParams } from 'react-router'
import { getUserById } from '~/utils/models/user.model'


export async function loader ({ request }: Route.LoaderArgs) {

  // get the cookie from the request headers
  const session = await getSession(request.headers.get('cookie'))

  // get the cookie, user, and authorization from the session
  const cookie =  request.headers.get('cookie')
  const user = session.get('user')
  const authorization = session.get('authorization')

  // if the user or authorization is not found, return an error
  if (!cookie || !user?.id || !authorization) {
    return { success: false, status: {
        status: 401,
        data: null,
        message: 'Unauthorized'
      }}
  }

  return { cookie, user, authorization }
//
//   const folder = await getFolderById(request, authorization, cookie)
//
//   if (!Folder) {
//     throw new Response('Folder not found', { status: 404 })
//   }
//
//   return folder
// }

// export async function action ({ params, request }: Route.ActionArgs) {
//   const formData = await request.formData()
//   return putFolder(params.contactId, {
//     name: formData.get('name') === 'true'
//   })
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
  const { cookie, user, authorization } = loaderData

  const params = useParams()
  const folderId = params.id

  if (!folderId) {
    return <div>Folder not found</div>
  }

  const folder = getFolderById(folderId, authorization, cookie)
  const folderUser = getUserById(user.id, authorization, cookie)

  // const folderData = {
  //   id: folder.id,
  //   parentFolderId: folder.parentFolderId,
  //   userId: folder.userId,
  //   name: folder.name
  // }

  const [selectedFolder, setSelectedFolder] = useState('All Folders')

  return (
    <div id="folder" className="space-y-1 pl-8">
      <Link
        to="/folder"
        key={folder.name}
        onClick={() => setSelectedFolder(folder.name)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        selectedFolder === folder.name
        ? 'bg-blue-50 text-blue-700 border border-blue-200'
        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
        }`}
        >
          <label htmlFor="folder" className="block mb-2 text-sm font-medium text-gray-700">
            <FileText className="w-4 h-4"/>
          </label>
          <span className="flex-1 text-left">{ folder.name }</span>
      </Link>
    </div>
  )
}

