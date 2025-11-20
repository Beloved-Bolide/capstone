import React, { useState } from 'react'
import { Link, Outlet, redirect, useActionData, useLoaderData } from 'react-router'
import type { Route } from './+types/dashboard'
import {
  type Folder,
  getFoldersByUserId,
  type NewFolder,
  NewFolderSchema,
  postFolder
} from '~/utils/models/folder.model'
import { getSession } from '~/utils/session.server'
import {
  Search,
  Plus,
  FolderOpen,
  Star,
  RotateCw,
  ClockAlert,
  FileText,
  Trash2,
  Settings,
  ChevronDown
} from 'lucide-react'
import { AddFolderForm } from '~/routes/dashboard/folder/add-folder-form'
import { getValidatedFormData } from 'remix-hook-form'
import { v7 as uuid } from 'uuid'
import { zodResolver } from '@hookform/resolvers/zod'


type Receipt = {
  id: number
  name: string
  date: string
  category: string
  folder: string
}

export function meta ({}: Route.MetaArgs) {
  return [
    { title: 'Dashboard - FileWise' },
    { name: 'Your FileWise Dashboard' }
  ]
}

const resolver = zodResolver(NewFolderSchema)

export async function loader ({ request }: Route.LoaderArgs) {

  const cookie = request.headers.get('cookie')
  const session = await getSession(cookie)
  const user = session.get('user')
  const authorization = session.get('authorization')

  if (!cookie || !user?.id || !authorization) {
    return { folders: null }
  }

  const folders: Folder[] = await getFoldersByUserId(user.id, authorization, cookie)
  return { folders }
}

export async function action ({ request }: Route.ActionArgs) {

  // get the form data from the request body
  const { errors, data, receivedValues: defaultValues } = await getValidatedFormData<NewFolder>(request, resolver)

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

  // return a success message
  return {
    success: true,
    status: {
      status: result.status,
      data: result.data,
      message: 'Folder created successfully!'
    }
  }
}

export default function Dashboard ({ loaderData, actionData }: Route.ComponentProps) {

  const receiptDetail = {
    store: 'ABC Store',
    address: '123 Main St, Anytown USA',
    date: '10/20/25',
    time: '14:35:22',
    items: [
      { name: 'Face and hair Serum calms', qty: 1, price: 109.00, amount: 109.00 },
      { name: 'Soap and face wash', qty: 1, price: 52.50, amount: 52.50 },
      { name: 'Leather Desk', qty: 1, price: 6.00, amount: 6.00 }
    ],
    subtotal: 167.50,
    salesTax: 6.58,
    total: 154.06
  }

  // // transform backend folders into a hierarchical structure
  // const backendFolders = Array.isArray(loaderData?.folders) ? loaderData.folders : []
  // const allFoldersParent = backendFolders.find(f => f.name === 'All Folders' && f.parentFolderId === null)
  // const childFolders = allFoldersParent ? backendFolders.filter(f => f.parentFolderId === allFoldersParent.id) : []

  // const visibleFiles = selectedFolder === 'All Folders'
  //   ? files
  //   : files.filter(r => r.folder === selectedFolder)

  // const isAllFolders = selectedFolder === 'All Folders'
  // const subfolders = folders[0]?.children ?? []

  // if there are no folders, set the array to an empty array
  let { folders } = loaderData
  if (!folders) folders = []

  useActionData<typeof action>()

  const [selectedFolder, setSelectedFolder] = useState('All Folders')
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [displayNewFolderForm, setDisplayNewFolderForm] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out`}>

        {/* Logo */}
        <div className="px-4 lg:px-5 pb-5 pt-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md flex items-center justify-center">
                <img src="/logo-croppy.png" alt="logo"/>
              </div>
              <span className="text-xl font-bold text-gray-800">FileWise</span>
            </div>
            <button
              aria-label="Close sidebar"
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Create Folder Button */}
        <div className="px-3 lg:px-4 pt-4">
          <button
            onClick={() => {
              setDisplayNewFolderForm(!displayNewFolderForm)
            }}
            className="w-full flex items-center justify-center gap-2 px-3 lg:px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
          >
            <Plus className="w-4 h-4"/>
            <span>New Folder</span>
          </button>
        </div>

        {/* Folders */}
        <div className="flex-1 overflow-y-auto px-3 lg:px-4 py-4">
          <div className="space-y-1">

            <div className="w-full flex items-center gap-2">
              <div>
                {/* Add Folder Button */}
                <AddFolderForm
                  displayNewFolderForm={displayNewFolderForm}
                  actionData={actionData}
                  setDisplayNewFolderForm={setDisplayNewFolderForm}
                />
                {/* Folder*/}
                {folders.map((folder) => (
                  <div key={folder.id}>
                    <button
                      onClick={() => setSelectedFolder(folder.name)}
                      className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedFolder === folder.name
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4"/>
                      <span className="flex-1 text-left">{folder.name}</span>
                      {/*{folders.length > 0 && (*/}
                      {/*  <span className="text-xs text-gray-500">{folders.length}</span>*/}
                      {/*)}*/}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/*All Folders and Subfolders */}
            {/*{(() => {*/}

            {/*return (*/}
            {/*{Folders.map(route => (*/}
            {/*  <div key={folders.name} className="space-y-1">*/}
            {/*    <div className="w-full flex items-center gap-2">*/}

            {/*    </div>*/}

            {/*{all.children && (*/}
            {/*  <div className="space-y-1 pl-8">*/}
            {/*    {all.children.map((child) => (*/}
            {/*      <button*/}
            {/*        key={child.name}*/}
            {/*        onClick={() => setSelectedFolder(child.name)}*/}
            {/*        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${*/}
            {/*          selectedFolder === child.name*/}
            {/*            ? 'bg-blue-50 text-blue-700 border border-blue-200'*/}
            {/*            : 'text-gray-700 hover:bg-gray-50 border border-transparent'*/}
            {/*        }`}*/}
            {/*      >*/}
            {/*        <child.icon className="w-4 h-4"/>*/}
            {/*        <span className="flex-1 text-left">{child.name}</span>*/}
            {/*        {typeof child.count === 'number' && child.count > 0 && (*/}
            {/*          <span className="text-xs text-gray-500">{child.count}</span>*/}
            {/*        )}*/}
            {/*      </button>*/}
            {/*    ))}*/}
            {/*    <Outlet/>*/}
            {/*  </div>*/}
            {/*)}*/}
            {/*    </div>*/}
            {/*  ))}*/}
            {/*)*/}
            {/*})()}*/}

            {/* Other folders (Starred, Recent, Expiring, Trash) */}
            {/*{folders.slice(1).map((folder) => (*/}
            {/*  <button*/}
            {/*    key={folder.name}*/}
            {/*    onClick={() => setSelectedFolder(folder.name)}*/}
            {/*    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${*/}
            {/*      selectedFolder === folder.name*/}
            {/*        ? 'bg-blue-50 text-blue-700 border border-blue-200'*/}
            {/*        : 'text-gray-700 hover:bg-gray-50 border border-transparent'*/}
            {/*    }`}*/}
            {/*  >*/}
            {/*    <folder.icon className="w-4 h-4"/>*/}
            {/*    <span className="flex-1 text-left">{folder.name}</span>*/}
            {/*    {folder.count > 0 && (*/}
            {/*      <span className="text-xs text-gray-500">{folder.count}</span>*/}
            {/*    )}*/}
            {/*  </button>*/}
            {/*))}*/}
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-gray-200">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Settings className="w-4 h-4"/>
            <span className="flex-1 text-left">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-gray-50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-50 lg:opacity-100' : 'opacity-100'}`}>

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-3 lg:px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">

              {/* Mobile Menu Button */}
              <button aria-label="Open sidebar"
                      className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onClick={() => setSidebarOpen(true)}>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 lg:w-5 h-4 lg:h-5 text-gray-400"/>
                <input type="text" placeholder="Find file..."
                       className="w-full pl-9 lg:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
              </div>

              {/* New File Button */}
              <Link aria-label="Add new"
                    to="/new-file-record"
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <Plus className="w-5 h-5 text-gray-600"/>
              </Link>
            </div>

            {/* User Profile Dropdown */}
            <div className="flex items-center gap-2 lg:gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer"/>
              </label>
              <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                <div
                  className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-medium text-xs lg:text-sm">
                  DR
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden bg-gray-50">

          {/* Receipt List */}
          <div className="flex-1 overflow-y-auto bg-white">
            {folders.map((folder) => (
              <div key={folder.id}>
                <button
                  onClick={() => setSelectedFolder(folder.name)}
                  className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedFolder === folder.name
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <FolderOpen className="w-4 h-4"/>
                  <span className="flex-1 text-left">{folder.name}</span>
                  {/*{folders.length > 0 && (*/}
                  {/*  <span className="text-xs text-gray-500">{folders.length}</span>*/}
                  {/*)}*/}
                </button>
              </div>
            ))}
            {/*<div className="p-3 lg:p-4">*/}

            {/*  /!* Mobile: Show as cards *!/*/}
            {/*  <div className="lg:hidden space-y-3">*/}

            {/*    {isAllFolders ? (*/}
            {/*      // Show subfolders as cards when "All Folders" is selected*/}
            {/*      <div className="space-y-2">*/}
            {/*        {subfolders.map((sf) => (*/}
            {/*          <button*/}
            {/*            key={sf.name}*/}
            {/*            onClick={() => setSelectedFolder(sf.name)}*/}
            {/*            className="w-full p-4 border rounded-md bg-white border-gray-200 hover:bg-gray-50 transition-colors text-left"*/}
            {/*          >*/}
            {/*            <div className="flex items-center justify-between">*/}
            {/*              <div className="flex items-center gap-3">*/}
            {/*                <sf.icon className="w-5 h-5 text-gray-600"/>*/}
            {/*                <div>*/}
            {/*                  <div className="font-medium text-gray-900">{sf.name}</div>*/}
            {/*                  {typeof sf.count === 'number' && (*/}
            {/*                    <div className="text-xs text-gray-500">{sf.count} items</div>*/}
            {/*                  )}*/}
            {/*                </div>*/}
            {/*              </div>*/}
            {/*              <ChevronDown className="w-4 h-4 text-gray-400"/>*/}
            {/*            </div>*/}
            {/*          </button>*/}
            {/*        ))}*/}
            {/*      </div>*/}
            {/*    ) : (*/}

            {/*      // Show only files for the selected subfolder*/}
            {/*      <div className="space-y-3">*/}
            {/*        {visibleFiles.map((file) => (*/}
            {/*          <div*/}
            {/*            key={file.id}*/}
            {/*            className={`p-4 border rounded-md cursor-pointer transition-colors ${*/}
            {/*              selectedReceipt?.id === file.id*/}
            {/*                ? 'bg-blue-50 border-blue-200'*/}
            {/*                : 'bg-white border-gray-200 hover:bg-gray-50'*/}
            {/*            }`}*/}
            {/*            onClick={() => {*/}
            {/*              setSelectedReceipt(file)*/}
            {/*              setPreviewOpen(true)*/}
            {/*            }}*/}
            {/*          >*/}
            {/*            <div className="flex justify-between items-start mb-2">*/}
            {/*              <h3 className="font-medium text-gray-900">{file.name}</h3>*/}
            {/*              <ChevronDown className="w-4 h-4 text-gray-400"/>*/}
            {/*            </div>*/}
            {/*            <div className="flex justify-between text-sm text-gray-600">*/}
            {/*              <span>{file.date}</span>*/}
            {/*              <span className="px-2 py-1 bg-gray-100 rounded text-xs">{file.category}</span>*/}
            {/*            </div>*/}
            {/*          </div>*/}
            {/*        ))}*/}
            {/*      </div>*/}
            {/*    )}*/}
            {/*  </div>*/}

            {/*  /!* Desktop *!/*/}
            {/*  {isAllFolders ? (*/}

            {/*    // Show the subfolder grid when "All Folders" is selected*/}
            {/*    <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-3">*/}
            {/*      {subfolders.map((sf) => (*/}
            {/*        <button*/}
            {/*          key={sf.name}*/}
            {/*          onClick={() => setSelectedFolder(sf.name)}*/}
            {/*          className="p-4 bg-white rounded-md border border-gray-200 hover:bg-gray-50 text-left transition-colors"*/}
            {/*        >*/}
            {/*          <div className="flex items-center gap-3">*/}
            {/*            <sf.icon className="w-5 h-5 text-gray-600"/>*/}
            {/*            <div>*/}
            {/*              <div className="text-sm font-medium text-gray-900">{sf.name}</div>*/}
            {/*              {typeof sf.count === 'number' && (*/}
            {/*                <div className="text-xs text-gray-500">{sf.count} items</div>*/}
            {/*              )}*/}
            {/*            </div>*/}
            {/*          </div>*/}
            {/*        </button>*/}
            {/*      ))}*/}
            {/*    </div>*/}
            {/*  ) : (*/}

            {/*    // Show a table of files for the selected subfolder*/}
            {/*    <table className="hidden lg:table w-full text-sm">*/}
            {/*      <thead>*/}
            {/*      <tr className="border-b border-gray-200">*/}
            {/*        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">*/}
            {/*          <div className="flex items-center gap-2">*/}
            {/*            <ChevronDown className="w-4 h-4"/>*/}
            {/*            {selectedFolder}*/}
            {/*          </div>*/}
            {/*        </th>*/}
            {/*        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>*/}
            {/*        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>*/}
            {/*        <th className="w-8"></th>*/}
            {/*      </tr>*/}
            {/*      </thead>*/}
            {/*      <tbody>*/}
            {/*      {visibleFiles.map((receipt) => (*/}
            {/*        <tr*/}
            {/*          key={receipt.id}*/}
            {/*          className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedReceipt?.id === receipt.id ? 'bg-blue-50' : ''}`}*/}
            {/*          onClick={() => {*/}
            {/*            setSelectedReceipt(receipt)*/}
            {/*            setPreviewOpen(true)*/}
            {/*          }}*/}
            {/*        >*/}
            {/*          <td className="py-3 px-4 text-sm text-gray-900">{receipt.name}</td>*/}
            {/*          <td className="py-3 px-4 text-sm text-gray-600">{receipt.date}</td>*/}
            {/*          <td className="py-3 px-4 text-sm text-gray-600">{receipt.category}</td>*/}
            {/*          <td className="py-3 px-4">*/}
            {/*            <button aria-label="Row actions"*/}
            {/*                    className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">*/}
            {/*              <ChevronDown className="w-4 h-4"/>*/}
            {/*            </button>*/}
            {/*          </td>*/}
            {/*        </tr>*/}
            {/*      ))}*/}
            {/*      </tbody>*/}
            {/*    </table>*/}
            {/*  )}*/}
            {/*</div>*/}
          </div>

          {/* Receipt Preview - Desktop */}
          <div className="hidden xl:block w-120 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
            <div className="bg-white rounded-md shadow-sm p-4 lg:p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">receipt</h3>
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">LOGO</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs mb-1">RECEIPT #</div>
                    <div className="font-medium">12345</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">RECEIPT DATE</div>
                    <div className="font-medium">1-5-17</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">TIME</div>
                    <div className="font-medium">14:35:22</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">DUE DATE</div>
                    <div className="font-medium">2/28/2017</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-gray-500 text-xs mb-1">BILL TO</div>
                  <div className="text-sm">
                    <div className="font-medium">ABC Store</div>
                    <div className="text-gray-600">123 Main Street</div>
                    <div className="text-gray-600">New York, NY 10001</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-gray-500 text-xs mb-1">SHIP TO</div>
                  <div className="text-sm">
                    <div className="font-medium">ABC Store</div>
                    <div className="text-gray-600">123 Main Street</div>
                    <div className="text-gray-600">New York, NY 10001</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <table className="w-full text-sm">
                  <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs font-semibold text-gray-600">QTY</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-600">DESCRIPTION</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-600">UNIT PRICE
                    </th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-600">AMOUNT</th>
                  </tr>
                  </thead>
                  <tbody>
                  {receiptDetail.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2">{item.qty}</td>
                      <td className="py-2 text-gray-700">{item.name}</td>
                      <td className="py-2 text-right">{item.price.toFixed(2)}</td>
                      <td className="py-2 text-right">{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${receiptDetail.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sales Tax 5.875%</span>
                    <span className="font-medium">${receiptDetail.salesTax.toFixed(2)}</span>
                  </div>
                  <div
                    className="flex justify-between text-lg font-bold border-t-2 border-gray-900 pt-2">
                    <span>TOTAL</span>
                    <span>${receiptDetail.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <div className="text-2xl font-bold mb-2">Auth-Smith</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="font-semibold text-sm mb-3">TERMS & CONDITIONS</div>
                <div className="space-y-3 text-xs text-gray-600">
                  <div>
                    <div className="font-semibold mb-1">A Subtitle</div>
                    <div>Some text</div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">A Subtitle</div>
                    <div>
                      A paragraph of text with an <span className="text-blue-600 underline">unsupported link</span>.
                      A second row of text with a <span className="text-blue-600 underline">web link</span>.
                      An icon of a <span className="text-blue-600">profile</span> with info.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Receipt Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 xl:hidden flex items-end sm:items-center justify-center">
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-t-xl rounded-t-xl max-h-[90vh] overflow-y-auto">
            <div
              className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Receipt Details</h2>
              <button
                aria-label="Close preview"
                onClick={() => setPreviewOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-4 lg:p-6">
              <div className="bg-white rounded-md shadow-sm p-4 lg:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">receipt</h3>
                  <div
                    className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">LOGO</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">RECEIPT #</div>
                      <div className="font-medium">12345</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">RECEIPT DATE</div>
                      <div className="font-medium">1-5-17</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">TIME</div>
                      <div className="font-medium">14:35:22</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">DUE DATE</div>
                      <div className="font-medium">2/28/2017</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-gray-500 text-xs mb-1">BILL TO</div>
                    <div className="text-sm">
                      <div className="font-medium">ABC Store</div>
                      <div className="text-gray-600">123 Main Street</div>
                      <div className="text-gray-600">New York, NY 10001</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-gray-500 text-xs mb-1">SHIP TO</div>
                    <div className="text-sm">
                      <div className="font-medium">ABC Store</div>
                      <div className="text-gray-600">123 Main Street</div>
                      <div className="text-gray-600">New York, NY 10001</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-xs font-semibold text-gray-600">QTY</th>
                        <th className="text-left py-2 text-xs font-semibold text-gray-600">DESCRIPTION</th>
                        <th className="text-right py-2 text-xs font-semibold text-gray-600">PRICE</th>
                        <th className="text-right py-2 text-xs font-semibold text-gray-600">AMOUNT</th>
                      </tr>
                      </thead>
                      <tbody>
                      {receiptDetail.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2">{item.qty}</td>
                          <td className="py-2 text-gray-700">{item.name}</td>
                          <td className="py-2 text-right">{item.price.toFixed(2)}</td>
                          <td className="py-2 text-right">{item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${receiptDetail.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sales Tax 5.875%</span>
                      <span className="font-medium">${receiptDetail.salesTax.toFixed(2)}</span>
                    </div>
                    <div
                      className="flex justify-between text-lg font-bold border-t-2 border-gray-900 pt-2">
                      <span>TOTAL</span>
                      <span>${receiptDetail.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <div className="text-2xl font-bold mb-2">Auth-Smith</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="font-semibold text-sm mb-3">TERMS & CONDITIONS</div>
                  <div className="space-y-3 text-xs text-gray-600">
                    <div>
                      <div className="font-semibold mb-1">A Subtitle</div>
                      <div>Some text</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">A Subtitle</div>
                      <div>
                        A paragraph of text with an <span className="text-blue-600 underline">unsupported link</span>.
                        A second row of text with a <span className="text-blue-600 underline">web link</span>.
                        An icon of a <span className="text-blue-600">profile</span> with info.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}