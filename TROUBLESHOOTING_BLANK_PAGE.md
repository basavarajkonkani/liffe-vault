# Troubleshooting Blank Page Issue

## Issue: Blank page at localhost:5174

### Step 1: Check Browser Console

1. Open the page: http://localhost:5174
2. Press **F12** (or right-click → Inspect)
3. Go to the **Console** tab
4. Look for any red error messages
5. Share the error messages if you see any

### Step 2: Check Network Tab

1. In Developer Tools, go to **Network** tab
2. Refresh the page (Ctrl/Cmd + R)
3. Check if all files are loading (should see main.tsx, App.tsx, etc.)
4. Look for any failed requests (red status codes)

### Step 3: Clear Browser Cache

1. Press **Ctrl+Shift+R** (or **Cmd+Shift+R** on Mac) to hard refresh
2. Or clear browser cache:
   - Chrome: Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Click "Clear data"

### Step 4: Verify Servers Are Running

Check if both servers are running:

```bash
# Check backend (should show port 3000)
lsof -i :3000

# Check frontend (should show port 5174)
lsof -i :5174
```

### Step 5: Restart Frontend Server

```bash
# Kill the frontend process
lsof -ti:5174 | xargs kill -9

# Restart
cd frontend
npm run dev
```

### Step 6: Check for TypeScript Errors

```bash
cd frontend
npx tsc --noEmit
```

If you see errors, share them.

### Step 7: Try Different Browser

Sometimes browser extensions or cache can cause issues. Try:
- Chrome Incognito mode
- Different browser (Firefox, Safari)

### Common Issues & Solutions

#### Issue: "Cannot GET /"
**Solution**: The React Router is working. Navigate to `/login` instead:
```
http://localhost:5174/login
```

#### Issue: White screen with no errors
**Solution**: Check if the root div is rendering:
1. Open Developer Tools → Elements tab
2. Look for `<div id="root">`
3. Check if it has any children

#### Issue: Module not found errors
**Solution**: Reinstall dependencies:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### What to Share for Help

If the issue persists, please share:

1. **Console errors** (from browser Developer Tools)
2. **Network tab** (any failed requests)
3. **Terminal output** (from `npm run dev`)
4. **Browser and version** (e.g., Chrome 119)

### Quick Test

Try accessing these URLs directly:

1. **Root**: http://localhost:5174/
2. **Login**: http://localhost:5174/login
3. **Register**: http://localhost:5174/register

One of these should work. If `/login` works, the app is fine - just navigate there!

### Expected Behavior

- **/** → Should redirect to `/login`
- **/login** → Should show PIN login page
- **/register** → Should show email registration page

If you're seeing a blank page at `/`, try navigating to `/login` directly.
