import type { ActionFunctionArgs } from 'react-router'
import { postFolder, type Folder } from '~/utils/models/folder.model'
import { getSession } from '~/utils/session.server'
import { uuidv7 } from 'uuidv7'

export async function action ({ request }: ActionFunctionArgs) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Get session data
    const cookie = request.headers.get('cookie')
    const session = await getSession(cookie)
    const user = session.get('user')
    const authorization = session.get('authorization')

    // Check authentication
    if (!cookie || !user?.id || !authorization) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get form data
    const formData = await request.formData()
    const folderName = formData.get('folderName') as string
    const parentFolderId = formData.get('parentFolderId') as string | null

    // Validate folder name
    if (!folderName || folderName.trim().length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Folder name is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (folderName.trim().length > 64) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Folder name must be 64 characters or less'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create folder object
    const folder: Folder = {
      id: uuidv7(),
      parentFolderId: parentFolderId || null,
      userId: user.id,
      name: folderName.trim()
    }

    // Create the folder
    const { result } = await postFolder(folder, authorization, cookie)

    // Check if creation was successful
    if (result.status !== 200) {
      return new Response(JSON.stringify({
        success: false,
        error: result.message || 'Failed to create folder'
      }), {
        status: result.status || 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Return success
    return new Response(JSON.stringify({
      success: true,
      message: 'Folder created successfully',
      folderId: folder.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    // Handle other errors
    console.error('[create-folder] Error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create folder'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
