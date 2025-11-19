import { sql } from '../src/utils/database.utils.ts'
import { v7 as uuid } from 'uuid'

async function seedCategories(): Promise<void> {
  const predefinedCategories = [
    { color: '#4F46E5', icon: '📱', name: 'Electronics' },
    { color: '#10B981', icon: '🛒', name: 'Groceries' },
    { color: '#F59E0B', icon: '📺', name: 'Subscriptions' },
    { color: '#EC4899', icon: '👕', name: 'Clothing' },
    { color: '#06B6D4', icon: '✈️', name: 'Travel' },
    { color: '#8B5CF6', icon: '🎬', name: 'Entertainment' },
    { color: '#EF4444', icon: '💊', name: 'Health & Beauty' },
    { color: '#14B8A6', icon: '🏡', name: 'Home & Garden' }
  ]

  console.log('Seeding categories...')

  for (const category of predefinedCategories) {
    await sql `
      INSERT INTO category (id, name, icon, color)
      VALUES (${uuid()}, ${category.name}, ${category.icon}, ${category.color})
      ON CONFLICT (name) DO NOTHING
    `
  }

  console.log('✅ Categories seeded successfully!')
}

seedCategories()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })