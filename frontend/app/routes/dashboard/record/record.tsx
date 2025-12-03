import type { Route } from './+types/record'
import { useLoaderData, useNavigate } from 'react-router'
import { getSession } from '~/utils/session.server'
import { getRecordById, type Record } from '~/utils/models/record.model'
import { getFilesByRecordId, type File } from '~/utils/models/file.model'
import React, { useState } from 'react'
import { ArrowLeft, Star, Calendar, DollarSign, Building2, FileText, Package, Tag, AlertCircle } from 'lucide-react'


export async function loader ({ request, params }: Route.LoaderArgs) {

  // get the cookie, session, user, and authorization
  const cookie = request.headers.get('cookie')
  const session = await getSession(cookie)
  const user = session.get('user')
  const authorization = session.get('authorization')

  // if the cookie, user, or authorization is not found, return an error
  if (!cookie || !user?.id || !authorization) {
    return { record: null, files: [] }
  }

  // Get the record ID from params
  const recordId = params.recordId

  if (!recordId) {
    return { record: null, files: [] }
  }

  // Fetch the record and its files
  const record = await getRecordById(recordId, authorization, cookie)
  const filesData = record ? await getFilesByRecordId(recordId, authorization, cookie) : []
  const files = Array.isArray(filesData) ? filesData : []

  return { record, files }
}

export default function RecordPreview ({ loaderData }: Route.ComponentProps) {

  const { record, files: loadedFiles } = loaderData
  const files = Array.isArray(loadedFiles) ? loadedFiles : []
  const navigate = useNavigate()
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)

  if (!record) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Record not found</h3>
          <p className="text-gray-500">The requested record could not be found.</p>
        </div>
      </div>
    )
  }

  // format date helper
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const selectedFile = files && files.length > 0 ? files[selectedFileIndex] : null

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to folder</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {record.name || 'Untitled Document'}
                </h1>
                {record.isStarred && (
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              {record.description && (
                <p className="text-gray-600 text-sm">{record.description}</p>
              )}
            </div>
          </div>

          {/* Document Type Badge */}
          {record.docType && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-700">
                {record.docType}
              </span>
            </div>
          )}
        </div>

        {/* File Image Display */}
        {files && files.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">File Preview</h2>

            {/* File Thumbnails */}
            {files.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {files.map((file: File, index: number) => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFileIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-all ${
                      selectedFileIndex === index
                        ? 'border-cyan-500 ring-2 ring-cyan-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={file.fileUrl}
                      alt={`File ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main File Display */}
            {selectedFile && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <img
                  src={selectedFile.fileUrl}
                  alt={record.name || 'File preview'}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {/* OCR Data */}
            {selectedFile?.ocrData && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-cyan-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Extracted Text (OCR)
                </h3>
                <p className="text-sm text-cyan-800 whitespace-pre-wrap">{selectedFile.ocrData}</p>
              </div>
            )}
          </div>
        )}

        {/* Record Attributes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Company Name */}
            {record.companyName && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-cyan-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Company</div>
                  <div className="font-medium text-gray-900">{record.companyName}</div>
                </div>
              </div>
            )}

            {/* Amount */}
            {record.amount !== null && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Amount</div>
                  <div className="font-medium text-gray-900">${record.amount.toFixed(2)}</div>
                </div>
              </div>
            )}

            {/* Purchase Date */}
            {record.purchaseDate && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Purchase Date</div>
                  <div className="font-medium text-gray-900">{formatDate(record.purchaseDate)}</div>
                </div>
              </div>
            )}

            {/* Expiration Date */}
            {record.expDate && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Expiration Date</div>
                  <div className="font-medium text-gray-900">{formatDate(record.expDate)}</div>
                </div>
              </div>
            )}

            {/* Product ID */}
            {record.productId && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Product ID</div>
                  <div className="font-medium text-gray-900">{record.productId}</div>
                </div>
              </div>
            )}

            {/* Coupon Code */}
            {record.couponCode && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <Tag className="w-5 h-5 text-pink-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Coupon Code</div>
                  <div className="font-medium text-gray-900">{record.couponCode}</div>
                </div>
              </div>
            )}

            {/* Last Accessed */}
            {record.lastAccessedAt && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Last Accessed</div>
                  <div className="font-medium text-gray-900">{formatDate(record.lastAccessedAt)}</div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {record.notifyOn && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Notifications</div>
                  <div className="font-medium text-gray-900">Enabled</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
