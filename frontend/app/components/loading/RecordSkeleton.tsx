export function RecordSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse">
      <div className="flex flex-col h-full space-y-3">

        {/* Header with icon */}
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-gray-200 rounded-md w-10 h-10"></div>
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
        </div>

        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-full"></div>
        <div className="h-5 bg-gray-200 rounded w-2/3"></div>

        {/* Metadata */}
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/5"></div>
          </div>

          {/* Tag placeholder */}
          <div className="mt-2">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
