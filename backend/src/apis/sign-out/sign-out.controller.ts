import type { Request, Response } from 'express'
import { signOutAction } from './sign-out.model.ts'

export async function signOutController(request: Request, response: Response): Promise<void> {
  try {
    const result = await signOutAction(request)

    // Clear the backend session cookie (connect.sid)
    // Match the cookie options from the session configuration for reliable clearing
    response.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: false, // Should match session config
      sameSite: 'lax'
    })

    response.status(result.status).json(result)
  } catch (error) {
    response.status(500).json({
      status: 500,
      message: 'Error signing out. Please try again.',
      data: null
    })
  }
}