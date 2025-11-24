import type { Route } from './+types/folder'
import { Link, Outlet, useLoaderData } from 'react-router'
import { getFoldersByParentFolderId, getFolderByName, getFoldersByUserId } from '~/utils/models/folder.model'
import React, { useState } from 'react'
import { FileBox, FileText, FolderOpen } from 'lucide-react'
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
    return { childFolders: null, records: null }
  }

  // Get the splat parameter (everything after /dashboard/)
  const splat = params['*' as keyof typeof params] as string | undefined

  // Get the last segment as the current folder ID
  const segments = splat ? splat.split('/').filter(Boolean) : []
  const folderId = segments.length > 0 ? segments[segments.length - 1] : null

  // get child folders and records
  const childFolders: Folder[] = await getFoldersByParentFolderId(folderId, authorization, cookie)
  const records: Record[] = await getRecordsByFolderId(folderId, authorization, cookie)

  // return the folder data
  return { childFolders, records }
}

export default function Folder ({ loaderData }: Route.ComponentProps) {

  useLoaderData<typeof loader>()

  const { childFolders, records } = loaderData
  if (!childFolders || !records) return <>Files not found.</>

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
        </Link>
      </div>
      ))}
      {records.map((record) => (
      <div key={record.id}>
        <Link
        to={`./${record.id}`}
        onClick={() => setSelectedFolder(record.id)}
        className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        selectedFolder === record.name
        ? 'bg-blue-50 text-blue-700 border border-blue-200'
        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
        }`}
        >
          <FileBox className="w-4 h-4"/>
          <span className="flex-1 text-left">{record.name}</span>
        </Link>
      </div>
      ))}
    </div>
  )
}