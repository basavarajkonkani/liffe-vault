# Claim Guides Feature - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Apply Database Migration

**Using Supabase Dashboard (Easiest)**
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `backend/migrations/004_claim_guides.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned" - this is correct!

### Step 2: Verify Migration
Run this query in Supabase SQL Editor to verify:
```sql
SELECT category, title FROM claim_guides;
```
You should see 7 claim guides listed.

### Step 3: Restart Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Step 4: Test the Feature
1. Login to your app (any role)
2. Click **"Claim Guides"** in the sidebar
3. You should see 7 guide cards
4. Click any guide to view details

## 🎯 Quick Test Scenarios

### As Nominee/Owner (Read-Only)
1. Navigate to `/claim-guides`
2. Click on "Insurance Policy" guide
3. View the step-by-step instructions
4. Check required documents list
5. View contact information
6. You should NOT see "Add Guide", "Edit", or "Delete" buttons

### As Admin (Full Access)
1. Navigate to `/claim-guides`
2. Click **"Add Guide"** button
3. Fill in the form:
   - Category: "Vehicle Insurance"
   - Title: "How to Claim Vehicle Insurance"
   - Add at least 1 step
   - Add at least 1 document
4. Click **"Create Guide"**
5. Verify the new guide appears in the list
6. Click on the guide to view details
7. Click **"Edit"** to modify
8. Click **"Delete"** to remove (with confirmation)

## 📱 Navigation

The Claim Guides feature is accessible from:
- **Sidebar**: "Claim Guides" menu item (BookOpen icon)
- **Direct URLs**:
  - List: `http://localhost:5173/claim-guides`
  - Detail: `http://localhost:5173/claim-guides/:id`
  - Create: `http://localhost:5173/claim-guides/new` (Admin only)
  - Edit: `http://localhost:5173/claim-guides/:id/edit` (Admin only)

## 🎨 Design Features

✅ **Glassmorphism effects** - Frosted glass cards with backdrop blur  
✅ **Category icons** - Shield, Building, TrendingUp, etc.  
✅ **Smooth animations** - Hover effects and transitions  
✅ **Mobile responsive** - Works on all screen sizes  
✅ **Premium blue theme** - Consistent with app design  

## 🔐 Role-Based Access

| Feature | Owner | Nominee | Admin |
|---------|-------|---------|-------|
| View Guides List | ✅ | ✅ | ✅ |
| View Guide Details | ✅ | ✅ | ✅ |
| Create New Guide | ❌ | ❌ | ✅ |
| Edit Guide | ❌ | ❌ | ✅ |
| Delete Guide | ❌ | ❌ | ✅ |

## 🐛 Troubleshooting

### Issue: "Claim Guides" not showing in sidebar
**Solution**: Clear browser cache and refresh, or check if user is authenticated

### Issue: Migration fails
**Solution**: 
1. Check if `claim_guides` table already exists
2. If yes, drop it first: `DROP TABLE IF EXISTS claim_guides CASCADE;`
3. Re-run the migration

### Issue: "Not allowed by CORS" error
**Solution**: Backend CORS is already configured. Restart backend server.

### Issue: 404 on API calls
**Solution**: Verify backend is running on port 3000 and routes are mounted

### Issue: Can't create/edit guides as admin
**Solution**: Verify your user role is 'admin' in the database

## 📊 Default Guides Included

1. **Insurance Policy** - Life insurance claim process (7 steps)
2. **Bank Account** - Bank fund claim process (7 steps)
3. **Mutual Funds** - Mutual fund claim process (7 steps)
4. **Fixed Deposits** - FD claim process (7 steps)
5. **Property/Real Estate** - Property transfer process (8 steps)
6. **Digital Wallet / Online Services** - Digital asset claim (7 steps)
7. **Govt Schemes / Pension** - Government benefits claim (7 steps)

## ✨ Key Features

- **Step-by-step instructions** with numbered steps
- **Required documents checklist** with checkmarks
- **Contact information** for relevant authorities
- **Helpful links** to forms and resources
- **Important notes** about timelines and processes
- **Admin CRUD operations** with form validation
- **Delete confirmation** to prevent accidents
- **Empty state** when no guides exist

## 🎉 Success Indicators

You'll know the feature is working when:
- ✅ Sidebar shows "Claim Guides" menu item
- ✅ Clicking it shows 7 guide cards
- ✅ Each card shows category icon, title, step count, document count
- ✅ Clicking a card shows detailed guide with all information
- ✅ Admin users see "Add Guide", "Edit", "Delete" buttons
- ✅ Non-admin users don't see admin buttons
- ✅ All pages are mobile responsive
- ✅ Glassmorphism effects render correctly

## 📞 Need Help?

Check these files for implementation details:
- Backend API: `backend/src/routes/claim-guides.routes.ts`
- Frontend Pages: `frontend/src/pages/claim-guides/`
- Database Schema: `backend/migrations/004_claim_guides.sql`
- Full Documentation: `CLAIM_GUIDES_FEATURE.md`

---

**Estimated Setup Time**: 5 minutes  
**Difficulty**: Easy  
**Status**: ✅ Ready to use
