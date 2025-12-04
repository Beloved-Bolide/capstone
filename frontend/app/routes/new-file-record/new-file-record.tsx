import React, { useState } from 'react'
import {
  type NewRecord,
  type Record,
  NewRecordSchema,
  postRecord,
  getRecordById,
  updateRecord
} from '~/utils/models/record.model'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSession } from '~/utils/session.server'
import { v7 as uuid } from 'uuid'
import type { Route } from './+types/new-file-record'
import { type Folder, getFoldersByUserId } from '~/utils/models/folder.model'
import { type Category, getCategories } from '~/utils/models/category.model'
import { Form, Link, redirect, useActionData } from 'react-router'
import { StatusMessage } from '~/components/StatusMessage'
import { Star, Bell } from 'lucide-react'


const resolver = zodResolver(NewRecordSchema)

export async function loader ({ request }: Route.LoaderArgs) {

  const cookie = request.headers.get('cookie')
  const session = await getSession(cookie)
  const user = session.get('user')
  const authorization = session.get('authorization')

  if (!cookie || !user?.id || !authorization) {
    return { folders: null, categories: null, existingRecord: null }
  }

  // Check if we're editing an existing record
  const url = new URL(request.url)
  const recordId = url.searchParams.get('recordId')

  const folders: Folder[] = await getFoldersByUserId(user.id, authorization, cookie)
  const categories: Category[] = await getCategories()

  // Fetch existing record if recordId is provided
  let existingRecord: Record | null = null
  if (recordId) {
    existingRecord = await getRecordById(recordId, authorization, cookie)
  }

  return { folders, categories, existingRecord }
}

export async function action ({ request }: Route.ActionArgs) {

  // get the form data from the request body
  const { errors, data, receivedValues: defaultValues } = await getValidatedFormData<NewRecord>(request, resolver)

  // if there are errors, return them
  if (errors) return { errors, defaultValues }

  // get the cookie, user, and authorization from the session
  const cookie = request.headers.get('cookie')
  const session = await getSession(cookie)
  const user = session.get('user')
  const authorization = session.get('authorization')

  // if the user or authorization is not found, return an error
  if (!cookie || !user?.id || !authorization) {
    return {
      success: false, status: {
        status: 401,
        data: null,
        message: 'Unauthorized'
      }
    }
  }

  // Check if we're updating an existing record (from already-parsed form data)
  const existingRecordId = (defaultValues as any).existingRecordId as string | null

  let result

  if (existingRecordId) {

    // Update existing record
    const record = {
      id: existingRecordId,
      folderId: data.folderId,
      categoryId: data.categoryId,
      amount: data.amount,
      companyName: data.companyName,
      couponCode: data.couponCode,
      description: data.description,
      docType: data.docType,
      expDate: data.expDate,
      isStarred: data.isStarred ?? false,
      lastAccessedAt: new Date(),
      name: data.name,
      notifyOn: data.notifyOn ?? false,
      productId: data.productId,
      purchaseDate: data.purchaseDate
    }

    const response = await updateRecord(record, authorization, cookie)
    result = response.result

  } else {

    // Create a new record
    const record = {
      id: uuid(),
      folderId: data.folderId,
      categoryId: data.categoryId,
      amount: data.amount,
      companyName: data.companyName,
      couponCode: data.couponCode,
      description: data.description,
      docType: data.docType,
      expDate: data.expDate,
      isStarred: data.isStarred ?? false,
      lastAccessedAt: new Date(),
      name: data.name,
      notifyOn: data.notifyOn ?? false,
      productId: data.productId,
      purchaseDate: data.purchaseDate
    }
    const response = await postRecord(record, authorization, cookie)
    result = response.result
  }

  if (result.status !== 200) {
    return { success: false, status: result }
  }

  // Redirect to dashboard on success
  throw redirect('/dashboard')
}

export default function NewFileRecord ({ loaderData, actionData }: Route.ComponentProps) {

  let { folders, categories, existingRecord } = loaderData
  if (!folders) folders = []
  if (!categories) categories = []

  // Check if we're editing an existing record
  const isEditing = !!existingRecord

  const [docType, setDocType] = useState<string>(existingRecord?.docType || '')
  const [isStarred, setIsStarred] = useState(existingRecord?.isStarred || false)
  const [notifyOn, setNotifyOn] = useState(existingRecord?.notifyOn || false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Check if the amount field should be shown (only for Receipt/Invoice)
  const showAmountField = docType === 'Receipt/Invoice'

  // Prepare default values for the form
  const defaultValues = existingRecord ? {
    folderId: existingRecord.folderId,
    categoryId: existingRecord.categoryId,
    amount: existingRecord.amount,
    companyName: existingRecord.companyName,
    couponCode: existingRecord.couponCode,
    description: existingRecord.description,
    docType: existingRecord.docType,
    expDate: existingRecord.expDate,
    isStarred: existingRecord.isStarred,
    name: existingRecord.name,
    notifyOn: existingRecord.notifyOn,
    productId: existingRecord.productId,
    purchaseDate: existingRecord.purchaseDate
  } : {
    isStarred: false,
    notifyOn: false
  }

  // use the useRemixForm hook to handle form submission and validation
  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue
  } = useRemixForm<NewRecord>({
    mode: 'onSubmit',
    resolver,
    defaultValues
  })

  useActionData<typeof action>()

  // Helper: Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Handler: File input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  // Handler: Drag over
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  // Handler: Drop file
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  // Handler: Remove file
  const handleRemoveFile = () => {
    setSelectedFile(null)
    const fileInput = document.getElementById('dropzone-file') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-gray-50">

      {/* Main Content */}
      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">

          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isEditing ? 'Edit File' : 'New File Upload'}
            </h1>
            <p className="text-sm text-gray-600">
              {isEditing ? 'Update your document information' : 'Upload and organize your document'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">

            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Document Information' : 'Document Upload'}
              </h2>
            </div>

            {/* Card Body */}
            <Form onSubmit={handleSubmit} noValidate={true} method="POST">

              {/* Hidden field for existing record ID */}
              {isEditing && existingRecord && (
                <input type="hidden" name="existingRecordId" value={existingRecord.id}/>
              )}
              <div className="p-6">

                {/* Drag and Drop Area */}
                <div className="mb-8">
                  <label
                    htmlFor="dropzone-file"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-cyan-300 border-dashed rounded-lg cursor-pointer bg-cyan-50 hover:bg-cyan-100 transition-colors"
                  >
                    {!selectedFile ? (

                      // Placeholder UI - No file selected
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-10 h-10 mb-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-700">
                          <span className="font-semibold">Drag and Drop File Here</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          (automatically scanned)
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          or click to browse
                        </p>
                      </div>
                    ) : (
                      // File Details UI - File selected
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 w-full px-6">

                        {/* File Icon */}
                        <div className="w-16 h-16 mb-4 bg-cyan-200 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>

                        {/* File Details */}
                        <div className="text-center w-full mb-4">
                          <p className="text-sm font-semibold text-gray-900 truncate px-4" title={selectedFile.name}>
                            {selectedFile.name}
                          </p>
                          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-600">
                            <span>{formatFileSize(selectedFile.size)}</span>
                            <span className="text-gray-400">•</span>
                            <span className="uppercase">{selectedFile.name.split('.').pop() || 'File'}</span>
                          </div>
                        </div>

                        {/* Change File Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            handleRemoveFile()
                          }}
                          className="text-sm text-cyan-600 hover:text-cyan-700 font-medium hover:underline transition-colors"
                        >
                          Change file
                        </button>
                      </div>
                    )}
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </label>
                </div>

                {/* File Info Form */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      File Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* Document Type */}
                      <div>
                        <label
                          htmlFor="doc-type"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Document Type
                        </label>
                        <select
                          {...register('docType')}
                          id="doc-type"

                          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md hover:cursor-pointer focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none block w-full p-2.5"

                        >
                          <option value="">Select type...</option>
                          <option value="Receipt/Invoice">Receipt/Invoice</option>
                          <option value="Warranty">Warranty</option>
                          <option value="Coupon">Coupon</option>
                          <option value="Manual">Manual</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.docType && (
                          <p className="text-sm text-red-500">{errors.docType.message} </p>
                        )}
                      </div>

                      {/* Purchase Date */}
                      <div>
                        <label
                          htmlFor="purchaseDate"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Purchase Date
                        </label>
                        <input
                          {...register('purchaseDate')}
                          type="date"
                          id="purchaseDate"

                          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md hover:cursor-pointer focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none block w-full p-2.5"/>

                        {errors.purchaseDate && (
                          <p className="text-sm text-red-500">{errors.purchaseDate.message} </p>
                        )}
                      </div>

                      {/* File Name */}
                      <div className="md:col-span-2">
                        <label
                          htmlFor="name"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          File Name
                        </label>
                        <input
                          {...register('name')}
                          type="text"
                          id="name"

                          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none block w-full p-2.5"

                          placeholder="Enter file name"
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name.message} </p>
                        )}
                      </div>

                      {/* Folder */}
                      <div>
                        <label
                          htmlFor="folderId"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Folder
                        </label>
                        <select
                          {...register('folderId')}
                          id="folderId"

                          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md hover:cursor-pointer focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none block w-full p-2.5"

                        >
                          <option value="">Select folder...</option>
                          {folders
                            .filter(folder => !['All Folders', 'Recent', 'Starred', 'Expiring', 'Trash'].includes(folder.name))
                            .map((folder, index) => (
                              <option key={index} value={folder.id}>{folder.name}</option>
                            ))}
                        </select>
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name.message} </p>
                        )}
                      </div>

                      {/* Company Name */}
                      <div>
                        <label
                          htmlFor="companyName"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Company Name
                        </label>
                        <input
                          {...register('companyName')}
                          type="text"
                          id="companyName"
                          placeholder="Enter Company Name"

                          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none block w-full p-2.5"

                        />
                        {errors.companyName && (
                          <p className="text-sm text-red-500">{errors.companyName.message} </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Amount */}
                    <div>
                      <label
                        htmlFor="amount"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Amount
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <input
                          {...register('amount', { valueAsNumber: true })}
                          type="number"
                          id="amount"
                          step="1.00"

                          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none block w-full pl-8 p-2.5 placeholder-gray-400"

                          placeholder="0.00"
                        />
                        {errors.amount && (
                          <p className="text-sm text-red-500">{errors.amount.message} </p>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label
                        htmlFor="categoryId"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Category
                      </label>
                      <select
                        {...register('categoryId')}
                        id="categoryId"

                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md hover:cursor-pointer focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none block w-full p-2.5"

                      >
                        {categories.map((category, index) => <option key={index}
                                                                     value={category.id}>{category.icon + ' ' + category.name}</option>)}
                      </select>
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message} </p>
                      )}
                    </div>

                    {/* Product ID */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor="productId"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Product Id
                      </label>
                      <input
                        {...register('productId')}
                        type="text"
                        id="productId"
                        placeholder="Enter Product Id"

                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none block w-full p-2.5"

                      />
                      {errors.productId && (
                        <p className="text-sm text-red-500">{errors.productId.message} </p>
                      )}
                    </div>

                    {/* Expiration Date */}
                    <div>
                      <label
                        htmlFor="expDate"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Expiration Date
                      </label>
                      <input
                        {...register('expDate')}
                        type="date"
                        id="expDate"

                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md hover:cursor-pointer focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none block w-full p-2.5"

                      />
                      {errors.expDate && (
                        <p className="text-sm text-red-500">{errors.expDate.message} </p>
                      )}
                    </div>

                    {/* Coupon Code */}
                    <div>
                      <label
                        htmlFor="couponCode"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Coupon Code
                      </label>
                      <input
                        {...register('couponCode')}
                        type="text"
                        id="couponCode"
                        placeholder="Enter Coupon Code"

                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none block w-full p-2.5"

                      />
                      {errors.couponCode && (
                        <p className="text-sm text-red-500">{errors.couponCode.message} </p>
                      )}
                    </div>

                    {/* Toggle Buttons */}
                    <div className="md:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Starred */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Mark as Starred
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsStarred(!isStarred)
                              setValue('isStarred', !isStarred)
                            }}
                            className={`cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition-all ${
                              isStarred
                                ? 'bg-yellow-50 border-yellow-400 hover:bg-yellow-100'
                                : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                            }`}
                          >
                            <Star
                              className={`w-5 h-5 transition-all ${
                                isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                              }`}
                              strokeWidth={2}
                            />
                            <span className={`text-sm font-medium ${
                              isStarred ? 'text-yellow-700' : 'text-gray-600'
                            }`}>
                              {isStarred ? 'Starred' : 'Not Starred'}
                            </span>
                          </button>
                          <input
                            {...register('isStarred')}
                            type="hidden"
                            value={isStarred ? 'true' : 'false'}
                          />
                          {errors.isStarred && (
                            <p className="text-sm text-red-500 mt-1">{errors.isStarred.message} </p>
                          )}
                        </div>

                        {/* Notifications On */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Notifications
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setNotifyOn(!notifyOn)
                              setValue('notifyOn', !notifyOn)
                            }}
                            className={`cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition-all ${
                              notifyOn
                                ? 'bg-blue-50 border-blue-400 hover:bg-blue-100'
                                : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                            }`}
                          >
                            <Bell
                              className={`w-5 h-5 transition-all ${
                                notifyOn ? 'text-blue-500' : 'text-gray-400'
                              }`}
                              strokeWidth={2}
                            />
                            <span className={`text-sm font-medium ${
                              notifyOn ? 'text-blue-700' : 'text-gray-600'
                            }`}>
                              {notifyOn ? 'Enabled' : 'Disabled'}
                            </span>
                          </button>
                          <input
                            {...register('notifyOn')}
                            type="hidden"
                            value={notifyOn ? 'true' : 'false'}
                          />
                          {errors.notifyOn && (
                            <p className="text-sm text-red-500 mt-1">{errors.notifyOn.message} </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor="description"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        id="description"
                        rows={2}

                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none block w-full p-2.5"

                        placeholder="Description..."
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500">{errors.description.message} </p>
                      )}
                    </div>
                  </div>

                  {/* Status Messages */}
                  {docType && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">Selected Type:</span> {docType}
                        {showAmountField ? (

                          <span className="text-cyan-600 ml-2">(Financial details available)</span>

                        ) : (
                          <span className="text-gray-500 ml-2">(Standard document)</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <Link to="/dashboard">
                    <button
                      type="button"
                      className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </Link>
                  <button
                    type="submit"
                    className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                  >
                    {isEditing ? 'Save Changes' : 'Upload File'}
                  </button>
                </div>
              </div>
              {/* Success Message */}
              <StatusMessage actionData={actionData}/>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}