import type { Route } from './+types/folders'
import { type Folder, FolderSchema } from '~/utils/models/folder.model'
import { getFoldersByUserId } from '~/utils/models/folder.model'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSession } from '~/utils/session.server'
import * as diagnostics_channel from 'node:diagnostics_channel'
import { BrowserRouter, Outlet, Routes } from 'react-router'
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

  // get the folders for the user from the server
  const folders: Folder[] | null = await getFoldersByUserId(user.id, authorization, cookie)

  // return the folders
  return { folders }
}

export default function Folders ({ loaderData }: Route.ComponentProps) {

  const { folders } = loaderData
  if (folders === null) return <>No Folders Found</>

  return (
  <div>
    {folders.map((folder) => (
    <div key={folder.id}>
      {folder.name}
    </div>
    ))}
  </div>
  )
}