import type { Route } from './+types/new-folder'
import { Form, redirect, useActionData } from 'react-router'
import { FileText } from 'lucide-react'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { type NewFolder, newFolderSchema, postFolder } from '~/utils/models/folder.model'
import { zodResolver } from '@hookform/resolvers/zod'
import { StatusMessage } from '~/components/StatusMessage'
import React, { useRef } from 'react'
import { getSession } from '~/utils/session.server'
import { v7 as uuid } from 'uuid'


const resolver = zodResolver(newFolderSchema)

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

export default function NewFolder () {

  const actionData = useActionData<typeof action>()
  const formRef = useRef<HTMLFormElement>(null)

  const {
    handleSubmit,
    formState: { errors },
    register
  } = useRemixForm<NewFolder>({
    mode: 'onSubmit',
    resolver
  })

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  return (
  <div>

    {/* New Folder Form */}
    <Form ref={formRef} onSubmit={handleSubmit} noValidate={true} method="POST">
      <div className="flex gap-3 pl-3 rounded-md text-sm font-medium transition-colors border border-transparent">
        <label htmlFor="folder" className="self-center block text-sm font-medium text-gray-700">
          <FileText className="w-4 h-4"/>
        </label>
        <input
        {...register('name')}
        id="name"
        type="text"
        placeholder="New Folder"
        onKeyDown={handleKeyDown}
        className={`w-full flex-1 items-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-colors text-gray-900 bg-gray-50 border border-gray-300  focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
        errors.name
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:ring-slate-500'
        }`}
        />
      </div>
      {errors.name && (
      <p className="text-sm text-red-500">{errors.name.message}</p>
      )}

      {/* Success Message */}
      <StatusMessage actionData={actionData}/>
    </Form>
  </div>
  )
}