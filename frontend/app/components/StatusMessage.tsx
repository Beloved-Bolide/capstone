import type { FormActionResponse } from '~/utils/interfaces/FormActionResponse'


type StatusMessageProps = { actionData: FormActionResponse | undefined }

export function StatusMessage (props: StatusMessageProps) {

  // destructure actionData from props
  const { actionData } = props

  // return early if actionData is invalid or missing success property
  if (!actionData || !('success' in actionData)) {
    return <></>
  }

  // extract message from actionData or use a default error message
  const message = actionData.status?.message ?? 'an unexplained error occurred';

  // determine styling based on success status
  const isSuccess = actionData.success;
  const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
  const borderColor = isSuccess ? 'border-green-200' : 'border-red-200';
  const textColor = isSuccess ? 'text-green-700' : 'text-red-700';

  return (
    <div className={`mt-4 p-4 ${bgColor} border ${borderColor} rounded-lg flex items-start gap-3`}>
      <div className="flex-1">
        {message && (
          <p className={`mt-1 text-sm ${textColor}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}