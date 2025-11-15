import React, { useState } from 'react'


const NewFile: React.FC = () => {
  const [fileType, setFileType] = useState<string>('')

  // Check if amount field should be shown (only for Receipt/Invoice)
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

                  {/* Date */}
                  <div>
                    <label
                      htmlFor="date"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
                      <option value="">Select folder...</option>
                      <option value="documents">Documents</option>
                      <option value="receipts">Receipts</option>
                      <option value="contracts">Contracts</option>
                      <option value="personal">Personal</option>
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

                  {/* Tags */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="tags"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
                      placeholder="Enter tags (comma separated)"
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
                          step="0.01"
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
                        <option value="">Select category...</option>
                        <option value="food">Food & Dining</option>
                        <option value="transportation">Transportation</option>
                        <option value="shopping">Shopping</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="bills">Bills & Utilities</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="business">Business</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label
                        htmlFor="payment-method"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Payment Method
                      </label>
                      <select
                        id="payment-method"
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      >
                        <option value="">Select method...</option>
                        <option value="cash">Cash</option>
                        <option value="credit">Credit Card</option>
                        <option value="debit">Debit Card</option>
                        <option value="check">Check</option>
                        <option value="digital">Digital Payment</option>
                      </select>
                    </div>

                    {/* Due Date */}
                    <div>
                      <label
                        htmlFor="due-date"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Due Date
                      </label>
                      <input
                        type="date"
                        id="due-date"
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor="notes"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Additional Notes
                      </label>
                      <textarea
                        id="notes"
                        rows={2}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
                        placeholder="Any additional notes..."
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

export default NewFile
