import type { Route } from './+types/folders'
import { type Folder, FolderSchema, type NewFolder, newFolderSchema, postFolder } from '~/utils/models/folder.model'
import { getFoldersByUserId } from '~/utils/models/folder.model'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSession } from '~/utils/session.server'
import * as diagnostics_channel from 'node:diagnostics_channel'
import { BrowserRouter, Outlet, redirect, Routes } from 'react-router'
import React, { useState } from 'react'
import { FileText, FolderOpen } from 'lucide-react'
import { getValidatedFormData } from 'remix-hook-form'
import { v7 as uuid } from 'uuid'


const resolver = zodResolver(newFolderSchema)

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
  const folders: Folder[] = await getFoldersByUserId(user.id, authorization, cookie)

  // return the folders
  return { folders }
}

export async function action ({ request }: Route.ActionArgs) {

  // get the form data from the request body
  const { errors, data, receivedValues: defaultValues } = await getValidatedFormData<NewFolder>(request, resolver)

  // if there are errors, return them
  if (errors) {
    return { errors, defaultValues }
  }

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

  // get the parent folder id from the request query parameters
  // code here

  // create a new folder object with the required attributes
  const folder = {
    id: uuid(),
    parentFolderId: null, // needs work
    userId: user.id,
    name: data.name
  }

  // post the folder to the server
  const { result } = await postFolder(folder, authorization, cookie)

  // if the post-request fails, return an error
  if (result.status !== 200) {
    return { success: false, status: result }
  }

  // redirect to the dashboard
  return redirect(`/../folders`)
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