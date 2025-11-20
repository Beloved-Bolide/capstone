import React, { useState } from 'react'
import { type NewRecord, NewRecordSchema, postRecord } from '~/utils/models/record.model'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSession } from '~/utils/session.server'
import { v7 as uuid } from 'uuid'
import type { Route } from './+types/new-file-record'
import { type FileRecord, FileRecordSchema } from '~/utils/models/file-record.model'
import { postFile } from '~/utils/models/file.model'
import { type Folder, getFoldersByUserId } from '~/utils/models/folder.model'
import { type Category, getCategories } from '~/utils/models/category.model'
import { Form, Link } from 'react-router'
import { type Record as RecordType } from '~/utils/models/record.model'


const resolver = zodResolver(NewRecordSchema)

export async function loader ({ request }: Route.LoaderArgs) {

  const cookie = request.headers.get('cookie')
  const session = await getSession(cookie)
  const user = session.get('user')
  const authorization = session.get('authorization')

  if (!cookie || !user?.id || !authorization) {
    return { folders: null }
  }

  const folders: Folder[] = await getFoldersByUserId(user.id, authorization, cookie)
  const categories: Category[] = await getCategories()
  return { folders, categories }
}

export async function action ({ request }: Route.ActionArgs) {

  // get the form data from the request body
  // const { errors, data, receivedValues: defaultValues } = await getValidatedFormData<FileRecord>(request, resolver)

  const { errors, data, receivedValues: defaultValues } = await getValidatedFormData<NewRecord>(request, resolver)

  // if there are errors, return them
  if (errors) {
    return { errors, defaultValues }
  }

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

  // create a new record object with the required attributes
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

  // create a new file object with the required attributes
  // const file = {
  //   id: uuid(),
  //   recordId: record.id,
  //   fileDate: new Date(),
  //   fileUrl: data.fileUrl,
  //   ocrData: data.ocrData
  // }

  // post the record and file to the API
  const { result } = await postRecord(record, authorization, cookie)
  // const fileResult = await postFile(file, authorization, cookie)

  // Check if EITHER failed
  //   if (recordResult.status !== 200 || fileResult.status !== 200) {
  //     return {
  //       success: false,
  //       status: recordResult.status !== 200 ? recordResult : fileResult
  //     }
  //   }

  if (result.status !== 200) {
    return { success: false, status: result }
  }

  return {
    success: true,
    status: {
      status: result.status,
      data: result.data,
      message: 'Record-File created successfully!'
    }
  }

}

export default function NewFileRecord ({ loaderData, actionData }: Route.ComponentProps) {

  let { folders, categories } = loaderData
  if (!folders) folders = []
  if (!categories) categories = []

  const [docType, setdocType] = useState<string>('')

  // Check if the amount field should be shown (only for Receipt/Invoice)
  const showAmountField = docType === 'Receipt/Invoice'

  // use the useRemixForm hook to handle form submission and validation
  const {
    handleSubmit,
    formState: { errors },
    register
  } = useRemixForm<NewRecord>({
    mode: 'onSubmit',
    resolver,
    defaultValues: {
      isStarred: false,
      notifyOn: false
    }
  })


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-white">New File Upload</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-md shadow-xl">
          {/* Card Header */}
          <div className="bg-blue-50 px-6 py-4 rounded-t-lg border-b border-blue-100">
            <h2 className="text-lg font-medium text-blue-900">Upload Document</h2>
          </div>

          {/* Card Body */}
          <Form onSubmit={handleSubmit} noValidate={true} method="POST">

            <div className="p-6">
              {/* Drag and Drop Area */}
              <div className="mb-8">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-blue-300 border-dashed rounded-md cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 mb-3 text-blue-400"
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
                  <input id="dropzone-file" type="file" className="hidden"/>
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
                        // value={docType}
                        // onChange={(e) => setDocType(e.target.value)}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      >
                        <option value="">Select type...</option>
                        <option value="Receipt/Invoice">Receipt/Invoice</option>
                        <option value="Warranty">Warranty</option>
                        <option value="Coupon">Coupon</option>
                        <option value="Manual">Manual</option>
                        <option value="Other">Other</option>
                      </select>
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
                        {...register('purchaseDate', { valueAsDate: true })}
                        type="date"
                        id="purchaseDate"
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
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
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
                        placeholder="Enter file name"
                      />
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
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      >
                        <option value="">Select folder...</option>
                        {folders.map((folder, index) => (
                          <option key={index} value={folder.name}>{folder.name}</option>
                        ))}
                      </select>
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
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
                      />
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
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 p-2.5 placeholder-gray-400"
                        placeholder="0.00"
                      />
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
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                      {categories.map((category, index) => <option key={index}
                                                                   value={category.id}>{category.icon + ' ' + category.name}</option>)}
                    </select>
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
                      {...register('expDate', { valueAsDate: true })}
                      type="date"
                      id="expDate"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    />
                  </div>

                  {/* Product Id */}
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
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
                    />
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
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
                    />
                  </div>

                  {/* Starred */}
                  <div>
                    <div>
                      <label
                        htmlFor="isStarred"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Mark as Starred
                      </label>
                      <input
                        {...register('isStarred')}
                        type="checkbox"
                        id="isStarred"
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="notifyOn"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Notify On
                      </label>
                      <input
                        {...register('notifyOn')}
                        type="checkbox"
                        id="notifyOn"
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
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
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
                      placeholder="Description..."
                    />
                  </div>
                </div>

                {/* Status Messages */}
                {docType && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-gray-900">Selected Type:</span> {docType}
                      {showAmountField ? (
                        <span className="text-blue-600 ml-2">(Financial details available)</span>
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-blue-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors cursor-pointer"
                >
                  Upload File
                </button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}