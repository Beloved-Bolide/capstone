import { sql } from '../src/utils/database.utils.ts'
import { v7 as uuid } from 'uuid'

// Sample data for generating varied records
const companyNames = [
  'Amazon', 'Best Buy', 'Target', 'Walmart', 'Home Depot', 'Lowe\'s',
  'Apple', 'Microsoft', 'Netflix', 'Spotify', 'Adobe', 'Costco',
  'CVS Pharmacy', 'Walgreens', 'Nike', 'Adidas', 'IKEA', 'Wayfair',
  'Whole Foods', 'Trader Joe\'s', 'REI', 'Dick\'s Sporting Goods'
]

const docTypes = [
  'Receipt', 'Invoice', 'Warranty', 'Coupon', 'Contract',
  'Subscription', 'Insurance', 'License', 'Certificate', 'Ticket'
]

const recordNames = [
  'Laptop Purchase', 'Monthly Subscription', 'Warranty Certificate',
  'Grocery Receipt', 'Travel Booking', 'Furniture Order', 'Gym Membership',
  'Software License', 'Insurance Policy', 'Event Ticket', 'Phone Bill',
  'Electronics Warranty', 'Appliance Receipt', 'Clothing Purchase',
  'Office Supplies', 'Home Repair', 'Car Maintenance', 'Medical Bill',
  'Streaming Service', 'Cloud Storage', 'VPN Service', 'Domain Registration'
]

const descriptions = [
  'Annual renewal - remember to cancel if not needed',
  'Important: Keep this for warranty claims',
  'Tax deductible - save for end of year',
  'Contains product serial numbers and warranty info',
  'Auto-renews monthly - check for better deals periodically',
  'Limited time offer - expires soon',
  'Lifetime warranty included',
  'Free shipping applied with this purchase',
  'Extended warranty coverage for 3 years',
  'Black Friday special deal'
]

// Helper function to get a random item from an array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Helper function to get a random date within a range
function randomDate(startDaysAgo: number, endDaysAgo: number): Date {
  const now = new Date()
  const start = new Date(now.getTime() - startDaysAgo * 24 * 60 * 60 * 1000)
  const end = new Date(now.getTime() - endDaysAgo * 24 * 60 * 60 * 1000)
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper function to get a future date
function futureDate(daysAhead: number): Date {
  const now = new Date()
  return new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
}

// Helper function to generate a random amount
function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

// Helper function to generate a coupon code
function generateCouponCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Helper function to generate a product ID
function generateProductId(): string {
  return `PRD-${Math.floor(Math.random() * 900000 + 100000)}`
}

async function seedRecords(userId: string): Promise<void> {
  console.log('🌱 Starting to seed test records...')

  // Get all categories
  console.log('📂 Fetching categories...')
  const categories = await sql`SELECT id FROM category`
  if (categories.length === 0) {
    console.error('❌ No categories found. Please run seed-categories.ts first!')
    return
  }
  console.log(`✅ Found ${categories.length} categories`)

  // Get all folders for the user
  console.log('📁 Fetching folders for user...')
  const folders = await sql`SELECT id, name FROM folder WHERE user_id = ${userId}`
  if (folders.length === 0) {
    console.error('❌ No folders found for this user. Please create some folders first!')
    console.error(`   User ID provided: ${userId}`)
    return
  }
  console.log(`✅ Found ${folders.length} folders`)

  // Generate 50 test records
  console.log('📝 Generating 50 test records...')

  for (let i = 0; i < 50; i++) {
    // Randomly distribute across folders
    const folder = randomItem(folders)
    const category = randomItem(categories)

    // Generate varied purchase dates (1 week to 2 years ago)
    const purchaseDate = randomDate(730, 7) // 2 years to 1 week ago

    // 40% chance of having an expiration date
    let expDate = null
    if (Math.random() < 0.4) {
      // Some expired, some in the future
      if (Math.random() < 0.3) {
        // Expired (1 to 90 days ago)
        expDate = randomDate(90, 1)
      } else {
        // Future (30 to 365 days from now)
        expDate = futureDate(Math.floor(Math.random() * 335 + 30))
      }
    }

    // 20% chance of being starred
    const isStarred = Math.random() < 0.2

    // 30% chance of having notifications enabled
    const notifyOn = Math.random() < 0.3

    // 70% chance of having a company name
    const companyName = Math.random() < 0.7 ? randomItem(companyNames) : null

    // Random amount between $10 and $5000
    const amount = Math.random() < 0.8 ? randomAmount(10, 5000) : null

    // 30% chance of having a coupon code
    const couponCode = Math.random() < 0.3 ? generateCouponCode() : null

    // 40% chance of having a product ID
    const productId = Math.random() < 0.4 ? generateProductId() : null

    // 60% chance of having a description
    const description = Math.random() < 0.6 ? randomItem(descriptions) : null

    // Random document type
    const docType = randomItem(docTypes)

    // Random record name
    const name = randomItem(recordNames)

    // Last accessed between purchase date and now
    const lastAccessedAt = randomDate(
      Math.floor((new Date().getTime() - purchaseDate.getTime()) / (24 * 60 * 60 * 1000)),
      0
    )

    // Insert the record
    await sql`
      INSERT INTO record (
        id,
        folder_id,
        category_id,
        amount,
        company_name,
        coupon_code,
        description,
        doc_type,
        exp_date,
        is_starred,
        last_accessed_at,
        name,
        notify_on,
        product_id,
        purchase_date
      )
      VALUES (
        ${uuid()},
        ${folder.id},
        ${category.id},
        ${amount},
        ${companyName},
        ${couponCode},
        ${description},
        ${docType},
        ${expDate},
        ${isStarred},
        ${lastAccessedAt},
        ${name},
        ${notifyOn},
        ${productId},
        ${purchaseDate}
      )
    `

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`   ✓ Created ${i + 1}/50 records`)
    }
  }

  console.log('✅ Successfully seeded 50 test records!')
  console.log('\n📊 Summary:')
  console.log(`   • Records distributed across ${folders.length} folders`)
  console.log(`   • Using ${categories.length} different categories`)
  console.log(`   • ~20% starred records`)
  console.log(`   • ~30% with notifications enabled`)
  console.log(`   • ~40% with expiration dates (mix of expired and future)`)
  console.log(`   • Varied amounts, dates, and document types`)
}

// Get user ID from command line argument or environment variable
const userId = process.argv[2] || process.env.USER_ID

if (!userId) {
  console.error('❌ Error: User ID is required!')
  console.error('   Usage: npm run seed:records <user-id>')
  console.error('   Or set USER_ID environment variable')
  process.exit(1)
}

console.log(`👤 Using User ID: ${userId}`)

seedRecords(userId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
