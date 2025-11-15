import { useState } from 'react'
import { Form, Link, redirect, useActionData } from 'react-router'
import { type SignIn, SignInSchema, postSignIn } from '~/utils/models/sign-in.model'
import { UserSchema } from '~/utils/models/user.model'
import { zodResolver } from '@hookform/resolvers/zod'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { FieldError } from '~/components/FieldError'
import { Eye, EyeOff } from 'lucide-react'
import type { Route } from './+types/sign-in'
import { commitSession, getSession } from '~/utils/session.server'
import { jwtDecode } from 'jwt-decode'
import { StatusMessage } from '~/components/StatusMessage'


export function meta ({}: Route.MetaArgs) {
  return [
    { title: 'Sign In - FileWise' },
    { name: 'description', content: 'Sign in to your FileWise account' }
  ]
}

export async function loader ({ request }: Route.LoaderArgs) {

  // get existing session from cookie
  const session = await getSession(
    request.headers.get('Cookie')
  )

  // check if the user is already authenticated
  if (session.has('user')) {
    return redirect('/dashboard')
  }
}

const resolver = zodResolver(SignInSchema)

export async function action ({ request }: Route.ActionArgs) {

  // get existing session from cookie
  const session = await getSession(
    request.headers.get('Cookie')
  )

  // get the form data from the request body
  const { errors, data, receivedValues: defaultValues } = await getValidatedFormData<SignIn>(request, resolver)

  // if there are errors, return them
  if (errors) {
    return { errors, defaultValues }
  }

  // post the form data to the server
  const { result, headers } = await postSignIn(data)

  // get the authorization header from the response
  const authorization = headers.get('authorization')

  // get the cookie from the response headers
  const expressionSessionCookie = headers.get('Set-Cookie')

  // if the response is not successful or the authorization header is not found, return false and an error message
  if (result.status !== 200 || !authorization) {
    return { success: false, status: result }
  }

  // parse the authorization header to extract the user information
  const parsedJwtToken = jwtDecode(authorization) as any

  // validate the user information
  const validationResult = UserSchema.safeParse(parsedJwtToken.auth)

  // if the user information is invalid, return false and an error message
  if (!validationResult.success) {
    session.flash('error', 'user is malformed')
    return { success: false,
      status: {
        status: 400,
        data: null,
        message: 'Sign in attempt failed! Try again'
      }
    }
  }

  // set the user information in the session
  session.set('authorization', authorization)
  session.set('user', validationResult.data)
  const responseHeaders = new Headers()
  responseHeaders.append('Set-Cookie', await commitSession(session))

  // if the cookie is found, set it in the response headers
  if (expressionSessionCookie) {
    responseHeaders.append('Set-Cookie', expressionSessionCookie)
  }

  // redirect to the dashboard
  return redirect('/dashboard', { headers: responseHeaders })
}

export default function SignInPage () {

  // get the action data from the server
  const actionData = useActionData<typeof action>()

  // state to toggle the password visibility
  const [showPassword, setShowPassword] = useState(false)

  // use the useRemixForm hook to handle form submission and validation
  const {
    handleSubmit,
    formState: { errors },
    register
  } = useRemixForm<SignIn>({ mode: 'onSubmit', resolver })

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
            Sign In
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

            {/*Submit Button*/}
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-6"
            >
              Sign In
            </button>

            {/* Success Message */}
            <StatusMessage actionData={actionData}/>
          </Form>

          {/*Sign Up Link*/}
          <div className="mt-6 text-center">
            <Link
              to="/sign-up"
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Don't have an account? Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}