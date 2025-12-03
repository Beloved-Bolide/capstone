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
  return arr[Math.floor(Math.random() * arr.length)]!
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

// A Helper function to generate a random amount
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
  const categoriesResult = await sql`SELECT id FROM category`
  const categories = Array.from(categoriesResult) as Array<{ id: string }>
  if (categories.length === 0) {
    console.error('❌ No categories found. Please run seed-categories.ts first!')
    return
  }
  console.log(`✅ Found ${categories.length} categories`)

  // Create folder structure: 10 parent folders, some with child folders
  console.log('📁 Creating folder structure...')
  const parentFolderNames = [
    'Personal Documents',
    'Work Files',
    'Financial Records',
    'Health & Medical',
    'Home & Property',
    'Education',
    'Travel',
    'Shopping',
    'Subscriptions',
    'Legal Documents'
  ]

  const folders: Array<{ id: string; name: string }> = []

  // Create parent folders
  for (const folderName of parentFolderNames) {
    const folderId = uuid()
    await sql`
      INSERT INTO folder (id, user_id, name, parent_folder_id)
      VALUES (${folderId}, ${userId}, ${folderName}, ${null})
    `
    folders.push({ id: folderId, name: folderName })
  }

  // Create child folders for some parents (40% chance each parent gets 1-3 children)
  const childFolderTemplates = [
    { parent: 'Work Files', children: ['Projects', 'Meetings', 'Reports'] },
    { parent: 'Financial Records', children: ['Taxes', 'Investments'] },
    { parent: 'Shopping', children: ['Electronics', 'Clothing'] },
    { parent: 'Health & Medical', children: ['Insurance', 'Prescriptions'] }
  ]

  for (const template of childFolderTemplates) {
    const parentFolder = folders.find(f => f.name === template.parent)
    if (parentFolder) {
      for (const childName of template.children) {
        const childId = uuid()
        await sql`
          INSERT INTO folder (id, user_id, name, parent_folder_id)
          VALUES (${childId}, ${userId}, ${childName}, ${parentFolder.id})
        `
        folders.push({ id: childId, name: childName })
      }
    }
  }

  console.log(`✅ Created ${parentFolderNames.length} parent folders and ${folders.length - parentFolderNames.length} child folders`)

  // Identify parent folders that have children
  const parentFoldersWithChildren = folders.filter(f =>
    folders.some(child => folders.find(p => p.name === f.name && folders.some(c => childFolderTemplates.some(t => t.parent === f.name))))
  )
  const parentsWithChildrenNames = childFolderTemplates.map(t => t.parent)
  const guaranteedParentFolders = folders.filter(f => parentsWithChildrenNames.includes(f.name))

  // Generate 24 test records
  console.log('📝 Generating 24 test records...')

  let recordsCreated = 0

  // First, ensure each parent folder with children gets 2 records (8 records total: 4 parents × 2)
  console.log('   ✓ Allocating records to parent folders with children...')
  for (const parentFolder of guaranteedParentFolders) {
    for (let j = 0; j < 2; j++) {
      await createRecord(folders, categories, parentFolder)
      recordsCreated++
    }
  }

  // Distribute the remaining 16 records randomly across all folders
  console.log('   ✓ Distributing remaining records across all folders...')
  for (let i = recordsCreated; i < 24; i++) {
    const folder = randomItem(folders)
    await createRecord(folders, categories, folder)
    recordsCreated++

    if (recordsCreated % 6 === 0) {
      console.log(`   ✓ Created ${recordsCreated}/24 records`)
    }
  }

  console.log('✅ Successfully seeded 24 test records!')
  console.log('\n📊 Summary:')
  console.log(`   • 10 parent folders with nested structure`)
  console.log(`   • ${folders.length} total folders (including child folders)`)
  console.log(`   • 4 parent folders guaranteed to contain both child folders AND records`)
  console.log(`   • Remaining records distributed randomly across all folders`)
  console.log(`   • Using ${categories.length} different categories`)
  console.log(`   • ~20% starred records`)
  console.log(`   • ~30% with notifications enabled`)
  console.log(`   • ~40% with expiration dates (mix of expired and future)`)
  console.log(`   • Varied amounts, dates, and document types`)
}

// Helper function to create a record
async function createRecord(
  folders: Array<{ id: string; name: string }>,
  categories: Array<{ id: string }>,
  folder: { id: string; name: string }
): Promise<void> {
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
}

// Get user ID from command the line argument or environment variable
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
