import { createCookieSessionStorage } from 'react-router'
import type { User } from '~/utils/models/user.model'
import * as process from 'node:process'


type SessionData = {
  user: User
  authorization: string
}

type SessionFlashData = {
  error: string
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      // a cookie from createCookie or the CookieOptions to create one
      cookie: {
        name: 'earl-grey',
        httpOnly: true,
        maxAge: 10800,
        path: '/',
        sameSite: 'strict',
        secrets: [process.env.SESSION_SECRET_1 as string],
        secure: true
      }
    }
  )

export async function isLoggedIn(request: Request) {
  const session = await getSession(request.headers.get("Cookie"))
  const user = session.get("user")

  // console.log('isLoggedIn check - user:', user)

  if (!user) {
    return { status: 401, message: 'Not logged in', data: null }
  }

  return { status: 200, message: 'Logged in', data: user }
}

export { getSession, commitSession, destroySession }