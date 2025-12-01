# FileWise Presentation

### PWP Presentations (60 seconds each; make sure to introduce yourself)
Order: Blu, Denise, Jijo, Trevor

### Introduce FileWise (2 minutes) (Denise)
#### What is FileWise? (Denise)
- FileWise is a web-based personal document storage service that helps individuals manage their receipts, coupons, warranties, and more!
#### What Problems Does FileWise Solve? (Denise)
- Misplacing a receipt or warranty only to find out it was lost or already expired
- Managing digital documents from multiple sources (emails, apps, stores) is confusing and scattered
- Coupons and warranties often go unused or expire, leading to lost savings and opportunities
#### Our Solution: FileWise (Denise)
- FileWise is a smart, web-based vault that gives individuals full control over their personal documents.
- With just a few clicks, users can upload, store, categorize, and search for any document.

### Product Planning (Jijo)

### Key Features (Jijo)
- Digital Document Storage – Upload photos of receipts; automatically extract key details like store name, date, and amount using OCR Optical Character Recognition.
- Smart Categorization – Automatically sort receipts by category, like restaurants or groceries, or by vendor.
- Secure Cloud Access – All data is encrypted and stored securely in the cloud, accessible from any device.
- Document Expiry Tracker – Set automatic reminders before a warranty, coupon, or return periods expire.
- Smart Search & Filters – Instantly find any receipt by keyword, date, or category.
- Spending Insights – Analyze spending patterns and generate downloadable reports for budgeting or taxes.

### Development Process
#### Sprint 1 (Jijo)
- Identified what pages were needed
- Created wireframes for all pages
#### Sprint 2 (Trevor)
- Created entity-relationship diagram and conceptual model
- Designed static pages and components using React
#### Sprint 3 (Trevor)
- Used ERD to create our PostgreSQL database (talk about relationships)
- Developed the backend using Express in the Node.js environment
- Created REST APIs for all entities (users, folders, record, file, category)
- Created a seeder to populate categories
#### Sprint 4 (Blu)
- Populated database with default folders upon sign-up
- Connected frontend forms to the backend APIs (React Router 7)
#### Sprint 5 (Blu)
- Used AI to develop creature comfort features, standardize UI design, and make the overall development process more efficient

### Demo (5 minutes) (Trevor)
#### 1. Sign-up (Blu)
- Demonstrate the sign-up process (talk about the creation of folders during sign-up)
#### 2. Sign-in (Blu)
- Directs you to the dashboard; displays all folders (GET HTTP request)
#### 3. Create a folder (Blu)
- Press Create Folder Button
- Modal pops up (component)
- Point out how the dashboard displays it immediately (GET HTTP request)
#### 4. Upload a receipt (Blu)
- Click the new file button
- Upload a receipt file
- Talk about the OCR feature
- Point out the folder dropdown contains the folder you just created
- Point out the automatic categorization feature and automatic form population
#### 5. Search for the receipt (Trevor)
#### 6. View the receipt (Trevor)
#### 7. Edit the receipt (Trevor)
#### 8. Delete the receipt (Trevor)
#### 9. View expenses page (Trevor)
- Point out the dynamic data

## Conlusion (Denise)
## Q&A