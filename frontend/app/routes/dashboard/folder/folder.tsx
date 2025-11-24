import type { Route } from './+types/folder'
import { Link, Outlet, useLoaderData } from 'react-router'
import { getChildFoldersFolderId, getFolderByName, getFoldersByUserId } from '~/utils/models/folder.model'
import React, { useState } from 'react'
import { FileText, FolderOpen } from 'lucide-react'
import { getSession } from '~/utils/session.server'
import type { Folder } from '~/utils/models/folder.model'
import { getRecordsByFolderId, type Record } from '~/utils/models/record.model'


export async function loader ({ request, params }: Route.LoaderArgs) {

  // get the cookie, session, user, and authorization
  const cookie = request.headers.get('cookie')
  const session = await getSession(cookie)
  const user = session.get('user')
  const authorization = session.get('authorization')

  // if the cookie, user, or authorization is not found, return an error
  if (!cookie || !user?.id || !authorization) {
    return { folder: null }
  }

  // get the full path from the request parameters
  const fullPath = params['*'] || ''

  // split the full path into segments and get the last segment
  const segments = fullPath.split('/').filter(Boolean)
  const lastParam = segments[segments.length - 1] || null

  // get the folders for the current user
  const childFolders: Folder[] = await getChildFoldersFolderId(lastParam, authorization, cookie)

  // get the files for the selected folder
  const records: Record[] = await getRecordsByFolderId(lastParam, authorization, cookie)

  // return the folder data
  return { childFolders }
}

export default function Folder ({ loaderData }: Route.ComponentProps) {

  useLoaderData<typeof loader>()

  const { childFolders } = loaderData
  if (!childFolders) return <>Child folders not found.</>

  // state to store the selected folder
  const [selectedFolder, setSelectedFolder] = useState('All Folders')

  return (
  <div>
    {childFolders.map((folder) => (
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
        <Outlet/>
      </Link>
    </div>
    ))}
  </div>
  )
}