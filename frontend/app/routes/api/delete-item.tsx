import type { ActionFunctionArgs } from 'react-router'
import { getSession } from '~/utils/session.server'
import { getFolderById, getFolderByName, deleteFolder, moveFolderToTrash } from '~/utils/models/folder.model'
import { deleteRecord, moveRecordToTrash } from '~/utils/models/record.model'

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
    const actionType = formData.get('actionType') as string
    const itemType = formData.get('itemType') as string
    const itemId = formData.get('itemId') as string

    // Validate required fields
    if (!actionType || !itemType || !itemId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Handle moveToTrash action
    if (actionType === 'moveToTrash') {
      const trashFolder = await getFolderByName('Trash', authorization, cookie)

      if (!trashFolder) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Trash folder not found. Please contact support.'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (!trashFolder.id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Trash folder configuration error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (itemType === 'folder') {
        const folder = await getFolderById(itemId, authorization, cookie)
        console.log(folder)

        if (!folder) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Folder not found'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        // Prevent deleting system folders
        if (folder.name === 'Trash' || folder.name === 'Starred' || folder.name === 'Recent' || folder.name === 'All Folders') {
          return new Response(JSON.stringify({
            success: false,
            error: 'Cannot delete system folders'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        // Prevent circular reference
        if (folder.id === trashFolder.id) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Cannot move trash folder to itself'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        await moveFolderToTrash(folder, trashFolder.id, authorization, cookie)

        return new Response(JSON.stringify({
          success: true,
          message: `Folder "${folder.name}" moved to trash`
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })

      } else if (itemType === 'record') {
        const recordData = formData.get('record') as string
        const record = JSON.parse(recordData)

        await moveRecordToTrash(record, trashFolder.id, authorization, cookie)

        return new Response(JSON.stringify({
          success: true,
          message: 'File moved to trash'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // Handle permanentDelete action
    if (actionType === 'permanentDelete') {
      if (itemType === 'folder') {
        const folder = await getFolderById(itemId, authorization, cookie)

        if (!folder) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Folder not found'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        const result = await deleteFolder(itemId, authorization, cookie)

        return new Response(JSON.stringify({
          success: true,
          message: result.result.message || `Folder "${folder.name}" permanently deleted`
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })

      } else if (itemType === 'record') {
        await deleteRecord(itemId, authorization, cookie)

        return new Response(JSON.stringify({
          success: true,
          message: 'File permanently deleted'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action type'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[Delete Item Route] Error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Delete operation failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
