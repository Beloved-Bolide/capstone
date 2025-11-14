import type { FieldErrors } from 'react-hook-form'


type Props = {
  errors: FieldErrors, field: string
}

export function FieldError (props: Props) {

  const { errors, field } = props
  if (errors [field]?.message) {
    return (<>
      <p className="mt-1 text-sm text-red-500">{errors[field].message as string}</p>
    </>)
  }
  return <></>
}