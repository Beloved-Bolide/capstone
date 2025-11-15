import type { Route } from './+types/folders'
import { type Folder, FolderSchema } from '~/utils/models/folder.model'
import { getFoldersByUserId } from '~/utils/models/folder.model'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSession } from '~/utils/session.server'
import * as diagnostics_channel from 'node:diagnostics_channel'
import { Outlet } from 'react-router'
import React, { useState } from 'react'
import { FileText, FolderOpen } from 'lucide-react'


const resolver = zodResolver(FolderSchema)

export async function loader ({ request, params }: Route.LoaderArgs) {

  // get the cookie from the request headers
  const session = await getSession(request.headers.get('cookie'))

  // get the cookie, user, and authorization from the session
  const cookie =  request.headers.get('cookie')
  const user = session.get('user')
  const authorization = session.get('authorization')

  // if the user or authorization is not found, return an error
  if (!cookie || !user?.id || !authorization) {
    return { folders: null }
  }

  // get the user id from the request query parameters
  const userId: string = params.toString()

  // get the folders for the user from the server
  const folders: Folder[] | null = await getFoldersByUserId(userId, authorization, cookie)

  // return the folders
  return { folders }
}

export default function Folders ({ loaderData }: Route.ComponentProps) {

  const { folders } = loaderData
  if (!folders) return <>No Folders Found</>

  const [selectedFolder, setSelectedFolder] = useState('All Folders')

  {/* All Folders and Subfolders */}
  {(() => {
    const all = folders[0]

    return (
      <div key={all.name} className="space-y-1">

        <div className="w-full flex items-center gap-2">
          <button
            onClick={() => setSelectedFolder(all.name)}
            className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedFolder === all.name
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50 border border-transparent'
            }`}
          >
            <FolderOpen className="w-4 h-4"/>
            <span className="flex-1 text-left">{all.name}</span>
            {/*{all.count > 0 && (*/}
            {/*  <span className="text-xs text-gray-500">{all.count}</span>*/}
            {/*)}*/}
          </button>
        </div>

        {all.children && (

          <div className="space-y-1 pl-8">
            {children.map((child: Folder) => (
              <button
                key={child.name}
                onClick={() => setSelectedFolder(child.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFolder === child.name
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <FileText className="w-4 h-4"/>
                <span className="flex-1 text-left">{child.name}</span>
                {typeof child.count === 'number' && child.count > 0 && (
                  <span className="text-xs text-gray-500">{child.count}</span>
                )}
              </button>
            ))}
          </div>

        )}

      </div>
    )
  })()}
}