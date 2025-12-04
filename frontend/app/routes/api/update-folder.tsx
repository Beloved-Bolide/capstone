import type { ActionFunctionArgs } from 'react-router'
import { getSession } from '~/utils/session.server'
import { updateFolder, type Folder } from '~/utils/models/folder.model'

export async function action ({ request }: ActionFunctionArgs) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Get user from session
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

    // Parse form data
    const formData = await request.formData()
    const folderId = formData.get('folderId') as string
    const folderName = formData.get('folderName') as string
    const parentFolderId = formData.get('parentFolderId') as string | null

    // Validate required fields
    if (!folderId || !folderName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create updated folder object
    const updatedFolder: Folder = {
      id: folderId,
      userId: user.id,
      name: folderName.trim(),
      parentFolderId: parentFolderId || null
    }

    // Update the folder
    await updateFolder(updatedFolder, authorization, cookie)

    return new Response(JSON.stringify({
      success: true,
      message: 'Folder updated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to update folder:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update folder'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
