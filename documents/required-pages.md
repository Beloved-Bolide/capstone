---
lang: en
title: required pages
---

# [REQUIRED PAGES]()

## [HOME PAGE—STATIC](Page 1)
- about section
- features section
- pricing section (optional)
- faq section (optional)
- contact section
- login/sign up buttons
- header
    - logo
    - nav bar
- footer
    - nav section
        - home
        - features
        - pricing (optional)
        - faq
        - contact
- ai chat bot
    - contact support
    - report a bug

## [SIGN UP/SIGN IN PAGE—DYNAMIC](Page 2)

### [SIGN UP]()
- name
- email
- password
- confirm password
- submit
- 2fa (optional)
- redirects you to dashboard
### [SIGN IN]()
- email
- password
- forgot password?
- submit
- redirects you to dashboard

## [DASHBOARD—DYNAMIC](Page 3)

### [NEW BUTTON]() (plus icon)
- opens a new file upload page
### [SEARCH BAR]()
- advanced search
    - file type (receipt, warranty, etc.)
    - extension type (pdf, doc, etc.)
    - folder
    - tag
    - date
    - size
    - file name
    - file description
    - file location (?)
- opens search results page (optional)
### [SETTINGS BUTTON]() (gear icon)
- opens the settings page
### [ORGANIZATION DROP DOWN MENU]()
- date
    - descending
    - ascending
- name
    - a-z
    - z-a
    - newest
    - oldest
- size
    - descending
    - ascending
- type
### [MAIN DASHBOARD INTERFACE]() (center section)
- main section where files reside based on the current folder selected
    - drag and drop files here
        - prompts the user to add/correct info
        - automatically scanned by google vison api
    - click on file to view
    - click on folder to view files in the folder
    - view option button
        - grid
        - list
    - file type filter button
        - all
        - receipts
        - warranties
        - etc.
    - file extension filter button
        - all
        - pdf
        - etc.
    - folder filter button (optional)
### [LEFT SIDEBAR]()
- collapse button
- all folders
    - receipts
    - warranties    
    - tax documents
    - instruction manuals
    - coupons
    - etc.
- expiring soon folder
- recent folder
- starred folder
- expenses folder
- tags
- trash
### [RIGHT SIDEBAR]()
- collapse button
- file preview
- file info
### [ACCOUNT BUTTON]()
- opens drop-down menu
    - settings
        - opens settings page

## [NEW FILE UPLOAD PAGE—DYNAMIC](Page 4)

### [DRAG AND DROP AREA]()
- automatically scanned by google vison api
### [FILE INFO FORM]()
- file name
- file type (receipt, warranty, etc.)
- date
- folder (dropdown of existing folders)
- tags (ability to add new tags)
- description
### [ADD TO EXPENSES]() (optional, if receipt)
- amount
- category
### [UPLOAD BUTTON]()
### [CANCEL BUTTON]()

## [SETTINGS—DYNAMIC](Page 5)

### [GENERAL SETTINGS]()
- language
- currency
- timezone
- date format
- time format
- 24-hour time
- dark mode
    - on
    - off
    - system default
### [PROFILE SETTINGS]()
- profile picture
- profile name
- profile bio
- profile location
- profile website
- profile email
- profile phone number
- profile social media
- profile tags
### [ACCOUNT SETTINGS]()
- name
- email
- password
- 2fa
### [APP SETTINGS]()
- default organization method
- default view method (grid/list)
- default file info to add (date, name, size, type, description, tags)
### [PRIVACY SETTINGS]()
- data sharing preferences
- ad preferences (if applicable)
### [NOTIFICATION SETTINGS]()
- email notifications
    - new features (optional)
    - security alerts
    - expiring documents
- in-app notifications
### [BILLING SETTINGS (IF APPLICABLE)]()
- subscription plan
- payment method
- billing history 
### [DELETE ACCOUNT]()

## [EXPENSES PAGE - DYNAMIC](Page 6)
### [CORE FEATURES]()
- table of expense entries linked to uploaded receipts
- filters by date range, category, vendor, amount
- export csv/pdf
- typical route: /expenses
- key ui/data:
- model: expense referencing fileid, with amount, date, category, notes

## [TAGS PAGE - DYNAMIC (OPTIONAL)]() TBC

