import type { Request, Response } from 'express'
import { signOutAction } from './sign-out-model'

export async function signOutController(request: Request, response: Response): Promise<void> {
  try {
    const result = await signOutAction(request)
    response.json(result)
  } catch (error) {
    response.json({
      status: 500,
      message: 'Error signing out. Please try again.',
      data: null
    })
  }
}