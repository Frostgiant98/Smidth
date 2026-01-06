# Setting Up BLOB_READ_WRITE_TOKEN Environment Variable

This guide explains how to get and set the `BLOB_READ_WRITE_TOKEN` environment variable for both local development and Vercel deployment.

## Step 1: Get Your Blob Token from Vercel

### Option A: From Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Log in to your account

2. **Navigate to Storage**
   - Click on your project (or create a new one)
   - In the project sidebar, click **Storage**
   - If you don't have Blob storage yet, click **Create Database**
   - Select **Blob** from the options
   - Click **Create**

3. **Get the Token**
   - After creating Blob storage, you'll see a **.env.local** section
   - Look for `BLOB_READ_WRITE_TOKEN`
   - Click the **Copy** button next to the token value
   - **Important**: Keep this token secret! Don't share it publicly.

### Option B: From Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (if not already linked)
vercel link

# Pull environment variables (creates .env.local)
vercel env pull .env.local
```

The token will be in the `.env.local` file.

---

## Step 2: Set Environment Variable Locally (For Development)

### Method 1: Create `.env.local` File (Recommended)

1. **Create a file named `.env.local`** in your project root directory (same level as `package.json`)

2. **Add the token**:
   ```env
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   Replace `vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual token.

3. **Save the file**

4. **Verify it's ignored by git** (should already be in `.gitignore`):
   ```bash
   # Check if .env.local is in .gitignore
   cat .gitignore | grep .env.local
   ```

### Method 2: Use Vercel CLI for Local Development

```bash
# Pull environment variables from Vercel
vercel env pull .env.local
```

This automatically creates `.env.local` with all your environment variables.

### Method 3: Set in Terminal (Temporary - Windows)

```powershell
# PowerShell
$env:BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

```cmd
# Command Prompt
set BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Method 4: Set in Terminal (Temporary - Mac/Linux)

```bash
export BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Note**: Terminal methods are temporary and only last for that session.

---

## Step 3: Set Environment Variable in Vercel (For Production)

### Method 1: Vercel Dashboard (Recommended)

1. **Go to your project** in [Vercel Dashboard](https://vercel.com/dashboard)

2. **Navigate to Settings**
   - Click on your project
   - Click **Settings** in the top navigation
   - Click **Environment Variables** in the sidebar

3. **Add the Variable**
   - Click **Add New**
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Paste your token (starts with `vercel_blob_rw_`)
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

4. **Redeploy** (if already deployed)
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Click **Redeploy**

### Method 2: Vercel CLI

```bash
# Set environment variable for production
vercel env add BLOB_READ_WRITE_TOKEN production

# Set for preview environments
vercel env add BLOB_READ_WRITE_TOKEN preview

# Set for development
vercel env add BLOB_READ_WRITE_TOKEN development
```

You'll be prompted to enter the token value.

---

## Step 4: Verify the Setup

### For Local Development

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Or use Vercel CLI** (recommended for testing API routes):
   ```bash
   vercel dev
   ```

3. **Test the app**:
   - Complete onboarding (PIN + Loan setup)
   - Try uploading a receipt
   - Check browser console for any errors

### For Production

1. **Check environment variables** in Vercel Dashboard:
   - Settings → Environment Variables
   - Verify `BLOB_READ_WRITE_TOKEN` is listed

2. **Check deployment logs**:
   - Go to Deployments → Latest deployment → Logs
   - Look for any errors related to blob storage

3. **Test the deployed app**:
   - Visit your Vercel URL
   - Try uploading a receipt
   - Check browser console for errors

---

## Troubleshooting

### Token Not Working Locally

1. **Check `.env.local` exists**:
   ```bash
   ls -la .env.local  # Mac/Linux
   dir .env.local     # Windows
   ```

2. **Verify token format**:
   - Should start with `vercel_blob_rw_`
   - Should be a long string (64+ characters)

3. **Restart dev server** after creating `.env.local`

4. **Use Vercel CLI** instead:
   ```bash
   vercel dev
   ```
   This automatically loads environment variables from Vercel.

### Token Not Working in Production

1. **Verify it's set in Vercel Dashboard**:
   - Settings → Environment Variables
   - Make sure it's set for Production environment

2. **Redeploy after adding**:
   - Environment variables are only loaded on deployment
   - Add the variable, then redeploy

3. **Check function logs**:
   - Deployments → Latest → Functions → View logs
   - Look for blob-related errors

### Common Errors

**Error: "BLOB_READ_WRITE_TOKEN is not defined"**
- Solution: Make sure the environment variable is set in the correct environment

**Error: "Invalid token"**
- Solution: Regenerate the token in Vercel Dashboard → Storage → Settings

**Error: "Failed to upload"**
- Solution: Check token has read/write permissions (should be `BLOB_READ_WRITE_TOKEN`)

---

## Security Best Practices

1. **Never commit `.env.local`** to git (already in `.gitignore`)
2. **Never share your token** publicly or in screenshots
3. **Regenerate token** if accidentally exposed
4. **Use different tokens** for different environments if needed
5. **Rotate tokens** periodically for security

---

## Quick Reference

```bash
# Local development with .env.local
echo "BLOB_READ_WRITE_TOKEN=your_token_here" > .env.local
npm run dev

# Or use Vercel CLI (recommended)
vercel dev

# Set in Vercel Dashboard
# Settings → Environment Variables → Add New
```

---

**Need Help?**
- Check [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- Check Vercel function logs in dashboard
- Verify token in Storage settings

