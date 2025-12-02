import React, { useState } from 'react'
import { getUploadUrl } from '~/utils/models/upload.model'

interface FileUploadProps {
  authorization: string
  cookie?: string | null
  onUploadComplete: (publicUrl: string) => void
  onUploadError: (error: string) => void
}

export default function FileUpload({ authorization, cookie, onUploadComplete, onUploadError }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
    }
    if (file.size > MAX_SIZE) {
      return 'File exceeds 5MB limit. Please compress or resize your image.'
    }
    if (file.size === 0) {
      return 'File is empty. Please select a valid file.'
    }
    return null
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        onUploadError(validationError)
        setIsUploading(false)
        return
      }

      // Step 1: Get pre-signed URL from backend
      setUploadProgress(20)
      const uploadUrlResponse = await getUploadUrl(file.type, file.size, authorization, cookie)

      if (uploadUrlResponse.status !== 200 || !uploadUrlResponse.data) {
        throw new Error(uploadUrlResponse.message || 'Failed to get upload URL')
      }

      const { uploadUrl, publicUrl } = uploadUrlResponse.data

      // Step 2: Upload file to Digital Ocean
      setUploadProgress(40)
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage')
      }

      // Step 3: Upload complete
      setUploadProgress(100)
      onUploadComplete(publicUrl)

    } catch (error) {
      console.error('Upload error:', error)
      onUploadError(error instanceof Error ? error.message : 'Upload failed')
      setSelectedFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      uploadFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      uploadFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
  }

  return (
    <div className="mb-8">
      <label
        htmlFor="dropzone-file"
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-blue-300 border-dashed rounded-lg ${
          isUploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        } bg-blue-50 hover:bg-blue-100 transition-colors`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {!selectedFile ? (
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
            <p className="text-xs text-gray-500">(automatically scanned)</p>
            <p className="text-xs text-gray-500 mt-2">or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP (max 5MB)</p>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-10 h-10 mb-3 text-blue-500 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-700 font-semibold">Uploading...</p>
            <p className="text-xs text-gray-500">{selectedFile.name}</p>
            <div className="w-48 bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-10 h-10 mb-3 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-700 font-semibold">Upload Complete!</p>
            <p className="text-xs text-gray-500">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                removeFile()
              }}
              className="mt-2 text-xs text-red-600 hover:text-red-800"
            >
              Remove & Upload New
            </button>
          </div>
        )}
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          disabled={isUploading}
        />
      </label>
    </div>
  )
}