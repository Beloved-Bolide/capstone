import React, { useState } from 'react'
import { type NewRecord, type Record, NewRecordSchema, postRecord, getRecordById, updateRecord } from '~/utils/models/record.model'
import { type NewFile, postFile } from '~/utils/models/file.model'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSession } from '~/utils/session.server'
import { v7 as uuid } from 'uuid'
import type { Route } from './+types/new-file-record'
import { type Folder, getFoldersByUserId } from '~/utils/models/folder.model'
import { type Category, getCategories } from '~/utils/models/category.model'
import { Form, Link, redirect, useActionData } from 'react-router'
import { StatusMessage } from '~/components/StatusMessage'
import { Star, Bell, X, FileText } from 'lucide-react'
import { uploadFileToSpaces } from '~/utils/upload.utils'


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

  // get the cookie, user, and authorization from the session first
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

  // Clone the request to read formData (can only be read once)
  const formData = await request.clone().formData()
  const uploadedFile = formData.get('file') as File | null

  // Upload file to DigitalOcean Spaces if present
  let fileUrl: string | null = null
  if (uploadedFile && uploadedFile.size > 0) {
    try {
      const uploadResponse = await uploadFileToSpaces(uploadedFile, authorization, cookie)
      fileUrl = uploadResponse.result.data.fileUrl
    } catch (error) {
      console.error('File upload error:', error)
      return {
        success: false,
        status: {
          status: 500,
          data: null,
          message: 'Failed to upload file to storage'
        }
      }
    }
  }

  // get the form data from the request body
  const { errors, data, receivedValues: defaultValues } = await getValidatedFormData<NewRecord>(request, resolver)

  // if there are errors, return them
  if (errors) return { errors, defaultValues }

  // Check if we're updating an existing record (from already-parsed form data)
  const existingRecordId = (defaultValues as any).existingRecordId as string | null

  let result
  let recordId: string

  if (existingRecordId) {

    // Update existing record
    recordId = existingRecordId
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
    recordId = uuid()
    const record = {
      id: recordId,
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

  // If a file was uploaded, create a file entry in the database
  if (fileUrl) {
    try {
      const fileEntry: NewFile = {
        id: uuid(),
        recordId: recordId,
        fileDate: new Date(),
        fileUrl: fileUrl,
        ocrData: null // OCR can be implemented later
      }

      await postFile(fileEntry, authorization, cookie)
    } catch (error) {
      console.error('Error saving file metadata:', error)
      // Continue even if file metadata fails - the record is already created
    }
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
  const [isDragging, setIsDragging] = useState(false)

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

  // File handling functions
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    // Reset the file input
    const fileInput = document.getElementById('dropzone-file') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-cyan-600 border-b border-cyan-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-white">
              {isEditing ? 'Edit File' : 'New File Upload'}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-md shadow-xl">
          {/* Card Header */}
          <div className="bg-cyan-50 px-6 py-4 rounded-t-lg border-b border-cyan-100">
            <h2 className="text-lg font-medium text-cyan-900">
              {isEditing ? 'Edit Document' : 'Upload Document'}
            </h2>
          </div>

          {/* Card Body */}
          <Form onSubmit={handleSubmit} noValidate={true} method="POST" encType="multipart/form-data">
            {/* Hidden field for existing record ID */}
            {isEditing && existingRecord && (
              <input type="hidden" name="existingRecordId" value={existingRecord.id} />
            )}
            <div className="p-6">

              {/* Drag and Drop Area */}
              <div className="mb-8">
                <label
                  htmlFor="dropzone-file"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-cyan-500 bg-cyan-100'
                      : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-cyan-300 bg-cyan-50 hover:bg-cyan-100'
                  }`}
                >
                  {!selectedFile ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-3 text-cyan-400"
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
                    <div className="flex items-center justify-between w-full px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <FileText className="w-10 h-10 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            ✓ File ready to upload
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          handleRemoveFile()
                        }}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove file"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  <input
                    id="dropzone-file"
                    name="file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx"
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
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md hover:cursor-pointer focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
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
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md hover:cursor-pointer focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"/>
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
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
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
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md hover:cursor-pointer focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                      >
                        <option value="">Select folder...</option>
                        {folders.map((folder, index) => (
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
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
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
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-8 p-2.5 placeholder-gray-400"
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
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md hover:cursor-pointer focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                    >
                      {categories.map((category, index) => <option key={index}
                                                                   value={category.id}>{category.icon + ' ' + category.name}</option>)}
                    </select>
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message} </p>
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
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md hover:cursor-pointer focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                    />
                    {errors.expDate && (
                      <p className="text-sm text-red-500">{errors.expDate.message} </p>
                    )}
                  </div>

                  {/* Product ID */}
                  <div>
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
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                    />
                    {errors.productId && (
                      <p className="text-sm text-red-500">{errors.productId.message} </p>
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
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                    />
                    {errors.couponCode && (
                      <p className="text-sm text-red-500">{errors.couponCode.message} </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    {/* Starred */}
                    <div>
                      <label className="block mb-3 text-sm font-medium text-gray-700">
                        Mark as Starred
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsStarred(!isStarred)
                          setValue('isStarred', !isStarred)
                        }}
                        className="inline-flex items-center justify-center p-3 rounded-md border-2 transition-all hover:bg-yellow-50"
                        style={{
                          borderColor: isStarred ? '#fbbf24' : '#e5e7eb',
                          backgroundColor: isStarred ? '#fffbf0' : 'white'
                        }}
                      >
                        <Star
                          className="w-6 h-6 transition-colors"
                          style={{
                            fill: isStarred ? '#fbbf24' : 'none',
                            color: isStarred ? '#fbbf24' : '#d1d5db',
                            strokeWidth: 1.5
                          }}
                        />
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
                      <label className="block mb-3 text-sm font-medium text-gray-700">
                        Notifications On
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifyOn(!notifyOn)
                          setValue('notifyOn', !notifyOn)
                        }}
                        className="inline-flex items-center w-full px-4 py-2 rounded-md border-2 transition-all hover:bg-cyan-50"
                        style={{
                          borderColor: notifyOn ? '#3b82f6' : '#e5e7eb',
                          backgroundColor: notifyOn ? '#f0f9ff' : 'white'
                        }}
                      >
                        <Bell
                          className="w-5 h-5 mr-2 transition-colors"
                          style={{ color: notifyOn ? '#3b82f6' : '#d1d5db' }}
                        />
                        <span style={{ color: notifyOn ? '#3b82f6' : '#6b7280' }} className="text-sm font-medium">
                          {notifyOn ? 'Notifications Enabled' : 'Disabled'}
                        </span>
                      </button>
                      <input
                        {...register('notifyOn')}
                        type="hidden"
                        value={notifyOn ? 'true' : 'false'}
                      />
                      {errors.notifyOn && (
                        <p className="text-sm text-red-500">{errors.notifyOn.message} </p>
                      )}
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
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                      placeholder="Description..."
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description.message} </p>
                    )}
                  </div>
                </div>

                {/* Status Messages */}
                {docType && (
                  <div className="bg-cyan-50 border border-cyan-200 rounded-md p-4">
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
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <Link to="/dashboard">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-cyan-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:ring-4 focus:outline-none focus:ring-cyan-300 transition-colors cursor-pointer"
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
  )
}