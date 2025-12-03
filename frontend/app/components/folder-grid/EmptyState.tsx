interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors text-sm font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
