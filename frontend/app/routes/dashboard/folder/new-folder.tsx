import type { Route } from './+types/new-folder'
import { Form, redirect, useActionData } from 'react-router'
import { FileText } from 'lucide-react'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { type Folder, FolderSchema, postFolder } from '~/utils/models/folder.model'
import { commitSession, getSession } from '~/utils/session.server'
import { zodResolver } from '@hookform/resolvers/zod'
import { jwtDecode } from 'jwt-decode'
import { UserSchema } from '~/utils/models/user.model'
import { StatusMessage } from '~/components/StatusMessage'
import { useRef } from 'react'
import { uuid } from 'zod'


const resolver = zodResolver(FolderSchema)

export async function action ({ request }: Route.ActionArgs) {

  // get existing session from cookie
  const session = await getSession(
    request.headers.get('Cookie')
  )

  const { errors, data, receivedValues: defaultValues } = await getValidatedFormData<Folder>(request, resolver)

  if (errors) {
    return { errors, defaultValues }
  }

  // get user from session
  const user = session.get('user')
  if (!user?.id) {
    return { success: false, status: { status: 401, message: 'Unauthorized' }}
  }

  // check authorization
  const authorization = session.get('authorization')
  if (!authorization) {
    return { success: false, status: { status: 401, message: 'Missing authorization header' }}
  }

  const { result, headers } = await postFolder(data, authorization)

  const expressionSessionCookie = headers.get('Set-Cookie')

  if (result.status !== 200) {
    return { success: false, status: result }
  }

  const parsedJwtToken = jwtDecode(authorization) as any
  const validationResult = UserSchema.safeParse(parsedJwtToken.auth)

  if (!validationResult.success) {
    session.flash('error', 'User is malformed')
    return { success: false, status: {
        status: 400,
        data: null,
        message: 'Folder creation attempt failed! Please try again'
      }}
  }

  session.set('user', validationResult.data)

  const responseHeaders = new Headers()
  responseHeaders.append('Set-Cookie', await commitSession(session))

  if (expressionSessionCookie) {
    responseHeaders.append('Set-Cookie', expressionSessionCookie)
  }

  return redirect('/dashboard', { headers: responseHeaders })
}

export default function NewFolder ({ loaderData }: Route.ComponentProps) {

  const actionData = useActionData<typeof action>()
  const formRef = useRef<HTMLFormElement>(null)

  const {
    handleSubmit,
    formState: { errors },
    register
  } = useRemixForm<Folder>({
    mode: 'onSubmit',
    resolver,

  })

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  return (
    <div>
      <Form ref={formRef} onSubmit={handleSubmit} noValidate={true} method="POST">
        <div className="flex flex-row">
          <label htmlFor="folder" className="block mb-2 text-sm font-medium text-gray-700">
            <FileText className="w-4 h-4"/>
          </label>
          <input
            {...register('name')}
            id="name"
            type="text"
            placeholder="New Folder"
            onKeyDown={handleKeyDown}
            className={`w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-slate-500'
            }`}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
        {/* Success Message */}
        <StatusMessage actionData={actionData}/>
      </Form>
    </div>
  )
}