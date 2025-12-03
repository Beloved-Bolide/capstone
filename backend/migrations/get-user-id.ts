import { sql } from '../src/utils/database.utils.ts'

async function getUserIds(): Promise<void> {
  console.log('👥 Fetching all users...\n')

  try {
    const users = await sql`
      SELECT id, name, email
      FROM "user"
      ORDER BY name
    `

    if (users.length === 0) {
      console.log('❌ No users found in the database.')
      return
    }

    console.log('📋 Available users:\n')
    users.forEach((user: any, index: number) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`)
      console.log(`   User ID: ${user.id}\n`)
    })

    console.log(`\n✅ Found ${users.length} user(s)`)
    console.log('\n💡 To seed records for a user, run:')
    console.log('   npm run seed:records <user-id>')
  } catch (error) {
    console.error('❌ Error fetching users:', error)
  }
}

getUserIds()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
