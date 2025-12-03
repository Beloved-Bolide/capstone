import { useLoaderData, useNavigate, Link, redirect } from 'react-router'
import { getRecordById, type Record } from '~/utils/models/record.model'
import { getSession } from '~/utils/session.server'
import type { Route } from './+types/record-detail'
import { FileText, Calendar, DollarSign, Building2, Tag, Star, Bell, Pencil, ArrowLeft } from 'lucide-react'

export async function loader ({ request, params }: Route.LoaderArgs) {
  try {
    // get the cookie, session, user, and authorization
    const cookie = request.headers.get('cookie')
    const session = await getSession(cookie)
    const user = session.get('user')
    const authorization = session.get('authorization')

    // if the cookie, user, or authorization is not found, redirect to sign-in
    if (!cookie || !user?.id || !authorization) {
      throw redirect('/sign-in')
    }

    // Get the record ID from params
    const recordId = params.recordId as string | undefined

    if (!recordId) {
      throw new Error('Record ID is required')
    }

    // Fetch the record
    const record = await getRecordById(recordId, authorization, cookie)

    if (!record) {
      throw new Error('Record not found')
    }

    return { record, error: null }
  } catch (error) {
    // If it's a redirect, rethrow it
    if (error instanceof Response) throw error

    // Otherwise, return error state
    return {
      record: null,
      error: {
        message: error instanceof Error ? error.message : 'Failed to load record'
      }
    }
  }
}

export default function RecordDetail ({ loaderData }: Route.ComponentProps) {
  const { record, error } = loaderData
  const navigate = useNavigate()

  // Helper function to format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (error || !record) {
    return (
      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error?.message || 'Failed to load record'}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button and actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <Link
            to={`/new-file-record?recordId=${record.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit</span>
          </Link>
        </div>

        {/* Record Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {record.name || 'Untitled Document'}
                  </h1>
                  {record.docType && (
                    <span className="inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      {record.docType}
                    </span>
                  )}
                </div>
              </div>
              {record.isStarred && (
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {record.companyName && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company</p>
                    <p className="text-base text-gray-900 mt-1">{record.companyName}</p>
                  </div>
                </div>
              )}

              {record.amount !== null && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="text-base text-gray-900 mt-1 font-semibold">
                      ${record.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {record.purchaseDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Purchase Date</p>
                    <p className="text-base text-gray-900 mt-1">{formatDate(record.purchaseDate)}</p>
                  </div>
                </div>
              )}

              {record.expDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Expiration Date</p>
                    <p className="text-base text-gray-900 mt-1">{formatDate(record.expDate)}</p>
                  </div>
                </div>
              )}

              {record.productId && (
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Product ID</p>
                    <p className="text-base text-gray-900 mt-1">{record.productId}</p>
                  </div>
                </div>
              )}

              {record.couponCode && (
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Coupon Code</p>
                    <p className="text-base text-gray-900 mt-1 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                      {record.couponCode}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {record.description && (
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                <p className="text-base text-gray-900 whitespace-pre-wrap">{record.description}</p>
              </div>
            )}

            {/* Notification Status */}
            {record.notifyOn && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 text-blue-600">
                  <Bell className="w-5 h-5" />
                  <span className="text-sm font-medium">Notifications enabled for this item</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
