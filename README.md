# School Result System - Setup Guide

## What You Need
- Cursor (you have this ✅)
- GitHub account (you have this ✅)
- Supabase account (free - sign up at https://supabase.com)
- Vercel account (free - sign up at https://vercel.com)
- Node.js installed (download from https://nodejs.org - get the LTS version)

---

## Step 1: Set Up Supabase (Your Database)

1. Go to https://supabase.com and sign up / log in
2. Click "New Project"
3. Give it a name: `school-result-system`
4. Set a database password (SAVE THIS - you'll need it)
5. Choose a region close to you
6. Click "Create Project" and wait for it to finish

### Run the Database Schema
1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click "New Query"
3. Open the file `supabase/schema.sql` from this project
4. Copy the ENTIRE contents and paste into the SQL Editor
5. Click **Run**
6. You should see "Success" - this creates all your tables + demo data

### Get Your API Keys
1. Go to **Project Settings** (gear icon) > **API**
2. Copy these two values:
   - `Project URL` (looks like: https://xxxxx.supabase.co)
   - `anon public` key (long string starting with "eyJ...")

### Create Your First User
1. Go to **Authentication** in the sidebar
2. Click **Add User** > **Create New User**
3. Enter an email and password (this is your admin login)
4. After creating the user, go to **SQL Editor** and run:

```sql
-- Replace the email with whatever you used above
INSERT INTO users (id, school_id, full_name, role)
SELECT id, '00000000-0000-0000-0000-000000000001', 'Admin', 'admin'
FROM auth.users
WHERE email = 'your-email@example.com';
```

This links your login to the demo school.

---

## Step 2: Open Project in Cursor

1. Open Cursor
2. File > Open Folder > select this `school-result-system` folder
3. Open the terminal in Cursor (Ctrl + ` or View > Terminal)
4. Run: `npm install`
5. Wait for packages to install

### Set Up Environment Variables
1. Copy `.env.local.example` to `.env.local`:
   ```
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and paste your Supabase values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-key-here
   ```

### Run Locally
```
npm run dev
```
Open http://localhost:3000 in your browser.
Login with the email/password you created in Supabase.

---

## Step 3: Push to GitHub

1. Create a new repo on GitHub (name: `school-result-system`)
2. In Cursor terminal:
   ```
   git init
   git add .
   git commit -m "Initial commit - school result system"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/school-result-system.git
   git push -u origin main
   ```

---

## Step 4: Deploy to Vercel (So Teachers Can Access It)

1. Go to https://vercel.com and sign up with GitHub
2. Click "Add New Project"
3. Import your `school-result-system` repo
4. In "Environment Variables", add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click "Deploy"
6. In about 1 minute, you'll get a live URL like:
   `https://school-result-system.vercel.app`

That's it. Teachers can now access the system from their phones or laptops.

---

## Project Structure

```
school-result-system/
├── app/
│   ├── layout.js          # Root layout
│   ├── page.js             # Landing (redirects)
│   ├── globals.css          # Styles
│   ├── login/page.js        # Login page
│   ├── dashboard/page.js    # Main dashboard
│   ├── scores/page.js       # Score entry grid
│   └── results/page.js      # Rankings + report cards
├── lib/
│   ├── supabase.js          # Database client
│   └── helpers.js           # Grading, ranking functions
├── supabase/
│   └── schema.sql           # Database setup script
├── .env.local.example       # Environment template
├── package.json
└── README.md                # This file
```

---

## How It Works

### For Teachers:
1. Login
2. Go to "Enter Scores"
3. Select class and subject
4. Type scores into the grid (Test 1, Test 2, Exam)
5. Totals calculate automatically
6. Click "Save Scores"
7. Repeat for each subject

### For Admin:
1. Go to "View Results"
2. Select class
3. See full ranking with positions
4. Click any student for report card
5. Print report card

### Key Features:
- Auto-calculation of totals, percentages, grades
- Automatic student ranking (handles ties)
- Fees status visible (PAID / OWES)
- Result withholding for unpaid fees
- Print-ready report cards
- All data saved securely in cloud

---

## Next Steps After Setup

1. **Test with real data** - Enter a full class of scores
2. **Give to a teacher** - Watch them use it, note confusion
3. **Fix what breaks** - Iterate based on feedback
4. **Demo to school owner** - Show real results generated

---

## Common Issues

**"Missing Supabase environment variables"**
→ Make sure .env.local exists and has your keys

**Login doesn't work**
→ Make sure you created a user in Supabase Auth AND linked them in the users table

**No classes showing**
→ The schema.sql includes demo data. Make sure you ran it in SQL Editor

**Scores not saving**
→ Check that RLS policies are working. The user must be linked to a school_id
