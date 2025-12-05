PWP Presentations (60 seconds each; make sure to introduce yourself)
Order: Blu, Denise, Jijo, Trevor

# FileWise

## Presentation Script

### Introduce FileWise (Denise - 2 minutes)

What is FileWise?
⦁	FileWise is a web-based personal document storage service that helps individuals manage their receipts, coupons, warranties, and more!

What Problems Does FileWise Solve?
⦁	Misplacing a receipt or warranty only to find out it was lost or already expired
⦁	Managing digital documents from multiple sources (emails, apps, stores) is confusing and scattered
⦁	Coupons and warranties often go unused or expire, leading to lost savings and opportunities

Our Solution: FileWise
⦁	FileWise is a smart, web-based vault that gives individuals full control over their personal documents.
⦁	With just a few clicks, users can upload, store, categorize, and search for any document.

### Sprint 1 (Jijo - 2 minutes)
- Set ground rules
- Defined personas and user stories
- Identified required pages
- Created wireframes for all pages
- *** Mention using Agile methodologies!!!
- (Product Planning)
- Digital Document Storage – Upload photos of receipts; automatically extract key details like store name, date, and amount using OCR Optical Character Recognition.
⦁	Smart Categorization – Automatically sort receipts by category, like restaurants or groceries, or by vendor.
⦁	Secure Cloud Access – All data is encrypted and stored securely in the cloud, accessible from any device.
⦁	Document Expiry Tracker – Set automatic reminders before a warranty, coupon, or return periods expire.
⦁	Smart Search & Filters – Instantly find any receipt by keyword, date, or category.
⦁	Spending Insights – Analyze spending patterns and generate downloadable reports for budgeting or taxes.


### Sprint 2 (Trevor - 1 minute 30 seconds for both)
- Created ERD(entity-relationship diagram) and conceptual model
- Designed static pages (React)
- Created components (React)

### Sprint 3 (Trevor)
- Used ERD to create the database (PostgreSQL)
- Developed the backend (Express)
- Created REST APIs for all entities

### Sprint 4 (Blu - 1 minute and 30 seconds for both)
- Populated database with default folders upon sign-up
- Connected frontend to backend (React Router 7)

### Sprint 5
- Used AI to develop features and help with UI design
- Styled and polished the frontend
- Added features that were not necessary for MVP

### Demo (ALL - 5 minutes)

GENERAL APP FLOW: user input -> action -> fetch -> backend/api route -> controller -> model -> database -> loader -> frontend

#### Home (Blu)
#### Sign-up (Blu)
- user input -> action -> fetch -> backend/api route -> controller -> model -> database -> loader -> frontend
- Here ZOD validates all the user's inputs so it is the correct format
- The action function is called when the user clicks the sign up button
- The action function calls a function that sends a fetch request to the backend to create a new user
- mailgun
#### Sign-in (Blu)
- Here ZOD validates all the user's inputs so it is the correct format
- The action function is called when the user clicks the sign in button
- The action function calls a function that sends a fetch request to the backend to authenticate the user and creates a session cookie, jwt token, and authorizes the user
#### Upload a receipt (Trevor)
- 
#### Create a folder (Trevor)
- 
#### Search for the receipt (Jijo)
- If you type any character in the search bar, it will show all the receipts that contain that character in their name
- FLow: search.tsx -> frontend/record.model.ts -> backend/routes/record.ts -> backend/controllers/record.ts -> backend/models/record.ts -> search-results-modal.tsx
#### View the receipt (Jijo)
#### Trash the receipt (Denise)
trash button action -> frontend model -> backend route -> backend controller -> backend model -> query database -> frontend loader -> frontend
#### Permanently delete something (Denise)
#### Restore the receipt (Denise)

### Conclusion (Denise) (45 seconds)
- Our Vision for the Future
  - FileWise will evolve into a personal finance companion, integrating AI-driven insights to:
  - Recommend budget improvements based on spending trends.
  - Auto-detect tax-deductible expenses.

### Conclusion and Questions (5 minutes)

### FileWise Presentation (9 minutes)
- What is this project? (90 seconds)
  - The Problem We’re Solving
    - People lose or misplace paper receipts, especially when they need them for returns, warranties, or taxes.
    - Managing digital receipts from multiple sources (emails, apps, stores) is confusing and scattered.
    - Coupons and warranty reminders often go unused or expire unnoticed, leading to lost savings and opportunities.
  - Our Solution: FileWise
    - FileWise is a smart, web-based vault that gives individuals full control over their receipts, warranties, and coupons in one organized place.
    - With just a few clicks, users can upload, store, categorize, and search any document — bringing simplicity and financial peace of mind to their daily lives.
  - Key Features
    - Digital Receipt Storage – Upload photos or PDFs of receipts; automatically extract key details like store name, date, and amount using OCR (Optical Character Recognition).
    - Smart Categorization – Automatically sort receipts by category (e.g., electronics, groceries, healthcare) or by vendor.
    - Secure Cloud Access – All data is encrypted and stored securely in the cloud, accessible across any device.
    - Warranty & Return Tracker – Set automatic reminders before warranty or return periods expire.
    - Coupon Keeper – Organize digital or scanned coupons with expiry notifications, so users never miss a saving opportunity.
    - Smart Search & Filters – Instantly find any receipt by keyword, date, or category.
    - Spending Insights – Analyze spending patterns and generate downloadable reports for budgeting or taxes.
