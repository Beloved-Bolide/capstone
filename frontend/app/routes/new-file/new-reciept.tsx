import React from "react";


export default function () {
  return (
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
      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
      placeholder="Enter file name"
      />
    </div>

    {/*/!* File Type *!/*/}
    {/*<div>*/}
    {/*  <label*/}
    {/*  htmlFor="file-type"*/}
    {/*  className="block mb-2 text-sm font-medium text-gray-700"*/}
    {/*  >*/}
    {/*    File Type*/}
    {/*  </label>*/}
    {/*  <select*/}
    {/*  id="file-type"*/}
    {/*  value={fileType}*/}
    {/*  onChange={(e) => setFileType(e.target.value)}*/}
    {/*  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"*/}
    {/*  >*/}
    {/*    <option value="">Select type...</option>*/}
    {/*    <option value="Receipt/Invoice">Receipt/Invoice</option>*/}
    {/*    <option value="Warranty">Warranty</option>*/}
    {/*    <option value="Contract">Contract</option>*/}
    {/*    <option value="Other">Other</option>*/}
    {/*  </select>*/}
    {/*</div>*/}

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
      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      >
        <option value="">Select folder...</option>
        <option value="personal">Personal</option>
        <option value="work">Work</option>
        <option value="medical">Medical</option>
        <option value="financial">Financial</option>
        <option value="home">Home</option>
      </select>
    </div>

    {/* Tags */}
    <div>
      <label
      htmlFor="tags"
      className="block mb-2 text-sm font-medium text-gray-700"
      >
        Tags
      </label>
      <input
      type="text"
      id="tags"
      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
      placeholder="Add tags (comma separated)"
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
      rows={3}
      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
      placeholder="Enter file description"
      />
    </div>
  </div>
  )

}