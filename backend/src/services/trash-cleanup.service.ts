/** Trash Cleanup Service
 * Automatically deletes folders and records that have been in trash for more than 30 days **/

// import { deleteExpiredTrashedFolders } from '../apis/folder/folder.model.ts'
// import { deleteExpiredTrashedRecords } from '../apis/record/record.model.ts'

/** Runs trash cleanup to permanently delete items older than 30 days
 * @returns Object with counts of deleted folders and records **/
// export async function runTrashCleanup(): Promise<{
//   foldersDeleted: number
//   recordsDeleted: number
//   timestamp: Date
// }> {
//   console.log('[Trash Cleanup] Starting automatic trash cleanup...')
//
//   try {
//     // Delete expired trashed records first (due to foreign key constraints)
//     const recordsDeleted = await deleteExpiredTrashedRecords()
//     console.log(`[Trash Cleanup] Deleted ${recordsDeleted} expired records`)
//
//     // Delete expired trashed folders
//     const foldersDeleted = await deleteExpiredTrashedFolders()
//     console.log(`[Trash Cleanup] Deleted ${foldersDeleted} expired folders`)
//
//     const result = {
//       foldersDeleted,
//       recordsDeleted,
//       timestamp: new Date()
//     }
//
//     console.log('[Trash Cleanup] Cleanup completed successfully', result)
//     return result
//   } catch (error) {
//     console.error('[Trash Cleanup] Error during cleanup:', error)
//     throw error
//   }
// }

/** Starts the scheduled trash cleanup service
 * Runs once per day at 2:00 AM **/
// export function startTrashCleanupScheduler(): void {
//   // Calculate time until next 2:00 AM
//   const now = new Date()
//   const next2AM = new Date()
//   next2AM.setHours(2, 0, 0, 0)
//
//   // If it's already past 2 AM today, schedule for tomorrow
//   if (now.getTime() > next2AM.getTime()) {
//     next2AM.setDate(next2AM.getDate() + 1)
//   }
//
//   const timeUntilFirst = next2AM.getTime() - now.getTime()
//
//   console.log(`[Trash Cleanup] Scheduler started. First cleanup at ${next2AM.toISOString()}`)
//
//   // Schedule first run
//   setTimeout(() => {
//     runTrashCleanup()
//
//     // Then run every 24 hours
//     setInterval(() => {
//       runTrashCleanup()
//     }, 24 * 60 * 60 * 1000) // 24 hours in milliseconds
//   }, timeUntilFirst)
//
//   // Optionally run cleanup on startup (disabled by default)
//   // Uncomment the line below to run cleanup immediately on server start
//   // runTrashCleanup()
// }