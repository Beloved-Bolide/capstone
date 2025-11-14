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

export { getSession, commitSession, destroySession }