import { useState } from 'react'
import { Form, Link, useActionData } from 'react-router'
import { postSignUp, type SignUp, SignUpSchema } from '~/utils/models/sign-up.model'
import { zodResolver } from '@hookform/resolvers/zod'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { FieldError } from '~/components/FieldError'
import { Eye, EyeOff } from 'lucide-react'
import { StatusMessage } from '~/components/StatusMessage'
import type { FormActionResponse } from '~/utils/interfaces/FormActionResponse'
import type { Route } from './+types/sign-up'


export function meta ({}: Route.MetaArgs) {
  return [
    { title: 'Sign Up - FileWise' },
    { name: 'description', content: 'Create your FileWise account' }
  ]
}

const resolver = zodResolver(SignUpSchema)

export async function action ({ request }: Route.ActionArgs): Promise<FormActionResponse> {

  console.log('arrive Action')
  const { errors, data, receivedValues: defaultValues } = await getValidatedFormData<SignUp>(request, resolver)

  if (errors) {
    return { errors, defaultValues }
  }
  const response = await postSignUp(data)
  console.log(response)

  if (response.status !== 200) {
    return { success: false, status: response }
  }
  return { success: true, status: response }
}

export default function SignUpPage () {

  const actionData = useActionData<typeof action>()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword] = useState(false)

  const {
    handleSubmit,
    formState: { errors },
    register
  } = useRemixForm<SignUp>({ mode: 'onSubmit', resolver })

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src="/logo-croppy.png" alt="FileWise logo"/>
          </div>
          <span className="text-2xl font-bold text-gray-800">FileWise</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Create Account
          </h2>

          <Form onSubmit={handleSubmit} className="space-y-4" noValidate={true} method="POST">

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <div>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-slate-500'
                  }`}
                />
              </div>
              <FieldError errors={errors} field={'email'}/>
            </div>

            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="relative">
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  placeholder="Enter Name"
                  className={`w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus: ring-slate-500'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <div>
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Password"
                  className={`w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus: ring-slate-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400"/>
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400"/>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message} </p>
              )}
            </div>

            {/* Password Confirm Field */}
            <div>
              <label htmlFor="passwordConfirm" className="block mb-2 text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div>
                <input
                  {...register('passwordConfirm')}
                  id="passwordConfirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className={`w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent${
                    errors.passwordConfirm
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus: ring-slate-500'
                  }`}
                />
              </div>
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-500">{errors.passwordConfirm.message} </p>
              )}
            </div>

            {/*Submit Button*/}
            <button
              type="submit"

              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-6"
            >
              Sign Up
            </button>

            {/* Success Message */}
            <StatusMessage actionData={actionData}/>

          </Form>

          {/*Sign In Link*/}
          <div className="mt-6 text-center">
            <Link
              to="/sign-in"
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Already have an account? Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
