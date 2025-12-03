export function FolderSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-gray-200 rounded-md w-10 h-10"></div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
}
