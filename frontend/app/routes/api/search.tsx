import type { LoaderFunctionArgs } from 'react-router'
import { searchRecords as searchRecordsAPI } from '~/utils/models/record.model'
import { getSession } from '~/utils/session.server'

export async function loader ({ request }: LoaderFunctionArgs) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    // Get search query and limit from URL params
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // Validate query
    if (!query || query.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Search query is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Get user from session
    const cookie = request.headers.get('cookie')
    const session = await getSession(cookie)
    const user = session.get('user')
    const authorization = session.get('authorization')

    // Check authentication
    if (!user?.id || !authorization) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    // Call backend search API
    const results = await searchRecordsAPI(query, authorization, cookie)

    return new Response(JSON.stringify({
      success: true,
      data: results || [],
      message: `Found ${results?.length || 0} results`
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('[Search Route] Error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      data: []
    }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}