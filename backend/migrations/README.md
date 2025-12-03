# Database Migrations and Seeding

This directory contains database migration and seeding scripts for the FileWise application.

## Available Scripts

### Get User ID
Find your user ID to use for seeding test data:

```bash
cd backend
npm run get:user-id
```

This will display all users in the database with their IDs.

### Seed Categories
Seed the database with predefined categories (Electronics, Groceries, Subscriptions, etc.):

```bash
cd backend
npm run seed:categories
```

### Seed Test Records
Generate 50 test records with varied properties:

```bash
cd backend
npm run seed:records <your-user-id>
```

Replace `<your-user-id>` with your actual user ID (get it from the `get:user-id` command).

## Test Records Features

The seed script generates 50 records with:

- **Varied ages**: Purchase dates ranging from 1 week to 2 years ago
- **Multiple folders**: Randomly distributed across all your folders (default and custom)
- **Mixed expiration dates**: ~40% have expiration dates (mix of expired and future dates)
- **Starred records**: ~20% are marked as starred
- **Notifications**: ~30% have notifications enabled
- **Document types**: Receipt, Invoice, Warranty, Coupon, Contract, Subscription, Insurance, License, Certificate, Ticket
- **Company names**: Amazon, Best Buy, Target, Walmart, Apple, Microsoft, Netflix, and more
- **Amounts**: Random amounts between $10 and $5,000
- **Coupon codes**: ~30% include generated coupon codes (e.g., "ABC12345")
- **Product IDs**: ~40% include product IDs (e.g., "PRD-123456")
- **Descriptions**: ~60% include helpful descriptions

## Example Workflow

1. First, make sure you're signed up in the application
2. Get your user ID:
   ```bash
   npm run get:user-id
   ```
3. Seed test records:
   ```bash
   npm run seed:records abc123-your-user-id-here
   ```
4. Refresh your dashboard to see the new test records!

## Notes

- Make sure your backend server has database access before running these scripts
- The seed:records script requires at least one folder to exist for your user
- Records are randomly distributed, so each run will produce different results
