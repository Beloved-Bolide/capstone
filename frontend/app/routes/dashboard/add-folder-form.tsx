import { Form } from 'react-router'
import React, { useEffect, useRef } from 'react'
import { useRemixForm } from 'remix-hook-form'
import { FolderOpen } from 'lucide-react'
import { StatusMessage } from '~/components/StatusMessage'
import { type NewFolder, NewFolderSchema } from '~/utils/models/folder.model'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FormActionResponse } from '~/utils/interfaces/FormActionResponse'
type Props = {
  displayNewFolderForm: boolean,
  actionData: FormActionResponse | undefined,
  setDisplayNewFolderForm: (displayNewFolderForm: boolean) => void
}


const resolver = zodResolver(NewFolderSchema)

export function AddFolderForm (props: Props) {

  const { displayNewFolderForm, actionData, setDisplayNewFolderForm } = props

  const formRef = useRef<HTMLFormElement>(null)

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset
  } = useRemixForm<NewFolder>({
    mode: 'onSubmit',
    resolver
  })

  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {

      // reset the form or hide it
      setDisplayNewFolderForm(false)
      reset()
    }
  }, [actionData, setDisplayNewFolderForm, reset])

  if (!displayNewFolderForm) return <></>

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
          <FolderOpen className="w-4 h-4"/>
        </label>
        <input
          {...register('name')}
          id="name"
          type="text"
          placeholder="New Folder"
          onKeyDown={handleKeyDown}
          className={`w-full flex-1 items-center gap-1 px-2 py-2.5 rounded-md text-xs font-medium transition-colors text-gray-900 bg-gray-50 border border-gray-300  focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
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
      {actionData && 'success' in actionData && actionData.success ? <></> : <StatusMessage actionData={actionData}/>}
    </Form>
  </div>
  )
}