import { uuid } from 'zod'
import { sql } from '../src/utils/database.utils.ts'


export async function up(): Promise<void> {

  const predefinedCategories = [
    { id: uuid().toString(), color: '#4F46E5', icon: '📱', name: 'Electronics' },
    { id: uuid().toString(), color: '#10B981', icon: '🛒', name: 'Groceries' },
    { id: uuid().toString(), color: '#F59E0B', icon: '📺', name: 'Subscriptions' },
    { id: uuid().toString(), color: '#EC4899', icon: '👕', name: 'Clothing' },
    { id: uuid().toString(), color: '#06B6D4', icon: '✈️', name: 'Travel' },
    { id: uuid().toString(), color: '#8B5CF6', icon: '🎬', name: 'Entertainment' },
    { id: uuid().toString(), color: '#EF4444', icon: '💊', name: 'Health & Beauty' },
    { id: uuid().toString(), color: '#14B8A6', icon: '🏡', name: 'Home & Garden' }
  ]

  for (const category of predefinedCategories) {
    await sql `
      INSERT INTO category (id, name, icon, color)
      VALUES (${category.id}, ${category.name}, ${category.icon}, ${category.color})
      ON CONFLICT (id) DO NOTHING
    `
  }
}