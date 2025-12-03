import type { Request } from 'express'
import type { Status } from '../../utils/interfaces/Status'

export async function signOutAction(request: Request): Promise<Status> {
  return await new Promise((resolve, reject) => {
    if (request.session) {
      request.session.destroy((error) => {
        if (error) {
          reject({
            status: 500,
            message: 'Could not sign out. Please try again.',
            data: null
          })
        } else {
          resolve({
            status: 200,
            message: 'Successfully signed out',
            data: null
          })
        }
      })
    } else {
      resolve({
        status: 200,
        message: 'No active session',
        data: null
      })
    }
  })
}