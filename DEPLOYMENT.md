# Vercel Deployment Guide

This guide explains how to deploy the Car Installment Tracker app to Vercel with Vercel Blob support.

## Prerequisites

1. A Vercel account ([sign up here](https://vercel.com))
2. Vercel CLI installed (`npm i -g vercel`)
3. Vercel Blob storage enabled on your project

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Vercel Blob

1. Go to your Vercel dashboard
2. Create a new project or select an existing one
3. Go to **Storage** → **Create Database** → Select **Blob**
4. Copy the `BLOB_READ_WRITE_TOKEN` environment variable

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
BLOB_READ_WRITE_TOKEN=your_token_here
```

Or set it in Vercel Dashboard:
- Go to **Project Settings** → **Environment Variables**
- Add `BLOB_READ_WRITE_TOKEN` with your token value

## Step 4: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **Add New Project**
4. Import your GitHub repository
5. Vercel will auto-detect Vite configuration
6. Add environment variable `BLOB_READ_WRITE_TOKEN`
7. Click **Deploy**

## Step 5: Verify Deployment

After deployment:

1. Visit your Vercel deployment URL
2. Complete the onboarding flow (PIN + Loan setup)
3. Try uploading a receipt image
4. Verify the receipt appears correctly

## API Routes

The app includes two serverless API routes:

- `/api/upload-receipt` - Uploads receipt images to Vercel Blob
- `/api/delete-receipt` - Deletes receipt images from Vercel Blob

These routes are automatically deployed as Vercel Edge Functions.

## Troubleshooting

### Receipts Not Uploading

1. Check that `BLOB_READ_WRITE_TOKEN` is set in Vercel environment variables
2. Verify Vercel Blob storage is enabled on your project
3. Check browser console for error messages
4. Check Vercel function logs in the dashboard

### Build Errors

1. Ensure all dependencies are installed: `npm install`
2. Check TypeScript errors: `npm run build`
3. Verify `vercel.json` configuration is correct

### CORS Issues

Vercel automatically handles CORS for API routes. If you encounter issues:
- Ensure API routes are in the `/api` directory
- Check that routes export a default handler function

## Local Development

For local development with Vercel Blob:

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel dev`
3. This will start a local server with API routes working

## Production Considerations

- Receipts are stored in Vercel Blob (cloud storage)
- Loan data and payments remain in IndexedDB (local storage)
- PIN hashes remain local-only for security
- The app works offline for viewing data, but receipt upload requires internet

## Cost Estimation

- **Vercel Hosting**: Free tier includes generous limits
- **Vercel Blob**: 
  - Free tier: 1 GB storage, 100 GB bandwidth/month
  - Paid: $0.15/GB storage, $0.15/GB bandwidth

For typical usage (receipt images ~500KB each), the free tier should be sufficient.

