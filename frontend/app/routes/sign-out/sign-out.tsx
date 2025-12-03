import { redirect } from 'react-router'
import { destroySession, getSession } from '~/utils/session.server'

/** Action for sign-out route.
 * Calls backend API to destroy the server session, clears the frontend session, and redirects to sign-in.
 * @param request Action request object **/
export async function action ({ request }: { request: Request }) {

  // Call backend API to destroy the server session
  try {
    await fetch(`${process.env.REST_API_URL}/sign-out`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error calling backend sign-out:', error)
  }

  // Destroy the frontend session
  const session = await getSession(request.headers.get("Cookie"))
  return redirect("/sign-in", {
    headers: {
      "Set-Cookie": await destroySession(session)
    }
  })
}