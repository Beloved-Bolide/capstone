import { useState } from 'react';

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
  <div className="mb-8">
    <label
    htmlFor="dropzone-file"
    className="flex flex-col items-center justify-center w-full h-48 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mb-2 text-sm text-gray-700 font-semibold">
          {selectedFile.name}
        </p>
        <p className="text-xs text-gray-500">
          {(selectedFile.size / 1024).toFixed(2)} KB
        </p>
        <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          removeFile();
        }}
        className="mt-2 text-xs text-red-600 hover:text-red-800"
        >
          Remove
        </button>
      </div>
      )}
      <input
      id="dropzone-file"
      type="file"
      className="hidden"
      onChange={handleFileChange}
      />
    </label>
  </div>
  );
}