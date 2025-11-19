import React, { useState } from 'react'
import { postRecord } from '~/utils/models/record.model'
import { getValidatedFormData } from 'remix-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSession } from '~/utils/session.server'
import { v7 as uuid } from 'uuid'
import type { Route } from './+types/new-file-record'
import { type NewFileRecord, NewFileRecordSchema } from '~/utils/models/file-record.model'
import { postFile } from '~/utils/models/file.model'
import { type Folder, getFoldersByUserId } from '~/utils/models/folder.model'
import {type Category, getCategories} from "~/utils/models/category.model";


const resolver = zodResolver(NewFileRecordSchema)

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
  return { folders,categories }
}

export async function action ({ request }: Route.ActionArgs) {

  // get the form data from the request body
  const { errors, data, receivedValues: defaultValues } = await getValidatedFormData<NewFileRecord>(request, resolver)

  // if there are errors, return them
  if (errors) {
    return { errors, defaultValues }
  }

  // get the cookie from the request headers
  const session = await getSession(request.headers.get('cookie'))

  // get the cookie, user, and authorization from the session
  const cookie = request.headers.get('cookie')
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
    expDate: data.expDate,
    isStarred: false,
    lastAccessedAt: new Date(),
    name: data.name,
    notifyOn: true,
    productId: data.productId,
    purchaseDate: data.purchaseDate
  }

  // create a new file object with the required attributes
  const file = {
    id: uuid(),
    recordId: record.id,
    fileDate: new Date(),
    fileKey: null,
    fileUrl: data.fileUrl,
    ocrData: data.ocrData
  }

  // // post the record-file to the server
  // const { recordResult } = await postRecord(record, authorization, cookie)
  // const { fileResult } = await postFile(file, authorization, cookie)

  const { result } = await postRecord(record, authorization, cookie) && await postFile(file, authorization, cookie)

  // if the post-request fails, return an error
  if (result.status !== 200) {
    return { success: false, status: result }
  }

  // return a success message
  return {
    success: true,
    status: {
      status: result.status,
      data: result.data,
      message: 'Record-File created successfully!'
    }
  }

}

export default function NewFilePage ({ loaderData, actionData }: Route.ComponentProps) {

  let { folders,categories } = loaderData
  if (!folders) folders = []
  if (!categories) categories = []

  const [fileType, setFileType] = useState<string>('')

  // Check if the amount field should be shown (only for Receipt/Invoice)
  const showAmountField = fileType === 'Receipt/Invoice'

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

                  {/* File Type */}
                  <div>
                    <label
                      htmlFor="file-type"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      File Type
                    </label>
                    <select
                      id="file-type"
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                      <option value="">Select type...</option>
                      <option value="Receipt/Invoice">Receipt/Invoice</option>
                      <option value="Warranty">Warranty</option>
                      <option value="Contract">Contract</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label
                      htmlFor="purchase-date"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      id="purchase-date"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    />
                  </div>

                  {/* File Name */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="file-name"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      File Name
                    </label>
                    <input
                      type="text"
                      id="file-name"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
                      placeholder="Enter file name"
                    />
                  </div>

                  {/* Folder */}
                  <div>
                    <label
                      htmlFor="folder"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Folder
                    </label>
                    <select
                      id="folder"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                      {folders.map((folder,index) => (
                        <option key={index} value={folder.name}>{folder.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Organization */}
                  <div>
                    <label
                      htmlFor="organization"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Organization
                    </label>
                    <input
                      type="text"
                      id="organization"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
                      placeholder="Enter organization name"
                    />
                  </div>
                </div>
              </div>

              {/* Receipt Details Section (Conditional) */}
              {showAmountField && (
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Receipt Details
                  </h3>

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
                        htmlFor="category"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Category
                      </label>
                      <select
                        id="category"
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      >
                        {categories.map((category,index)=><option key={index} value={category.id}>{category.icon + " " + category.name}</option>)}
                      </select>
                    </div>

                    {/* Expiration Date */}
                    <div>
                      <label
                        htmlFor="exp-date"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Expiration Date
                      </label>
                      <input
                        type="date"
                        id="exp-date"
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
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
                        id="description"
                        rows={2}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
                        placeholder="Description..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {fileType && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Selected Type:</span> {fileType}
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
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-blue-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors cursor-pointer"
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}