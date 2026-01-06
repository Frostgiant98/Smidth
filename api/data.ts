/**
 * Vercel Serverless API Route
 * Get and save app data (loan details, payments, PIN hash)
 * Stores data in Vercel Blob keyed by user ID
 */

import { put, list, del } from '@vercel/blob';

export const config = {
  runtime: 'nodejs',
};

const BLOB_PREFIX = 'app-data/';

async function getBlobKey(userId: string): Promise<string> {
  return `${BLOB_PREFIX}${userId}.json`;
}

export default async function handler(req: Request) {
  const { method } = req;
  
  // Parse query parameters from req.url
  // In Vercel, req.url can be relative, so we handle both cases
  let userId: string | null = null;
  
  try {
    const urlString = req.url;
    if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
      // Absolute URL
      const url = new URL(urlString);
      userId = url.searchParams.get('userId');
    } else {
      // Relative URL - manually parse query string
      const queryIndex = urlString.indexOf('?');
      if (queryIndex !== -1) {
        const queryString = urlString.substring(queryIndex + 1);
        const params = new URLSearchParams(queryString);
        userId = params.get('userId');
      }
    }
  } catch (error) {
    console.error('Error parsing URL:', error);
    // Fallback: try to extract userId from query string manually
    const match = req.url.match(/[?&]userId=([^&]+)/);
    userId = match ? decodeURIComponent(match[1]) : null;
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const blobKey = await getBlobKey(userId);

  if (method === 'GET') {
    try {
      // List blobs to find the one we need
      const { blobs } = await list({
        prefix: blobKey,
        limit: 1,
      });
      
      if (blobs.length === 0) {
        // Blob doesn't exist (first time user)
        return new Response(JSON.stringify(null), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Fetch the blob content from its URL
      const blob = blobs[0];
      const response = await fetch(blob.url);
      if (!response.ok) {
        throw new Error('Failed to fetch blob content');
      }
      
      const data = await response.text();
      return new Response(data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      // If blob doesn't exist, return null (first time user)
      if (error.status === 404 || error.message?.includes('not found') || error.message?.includes('404')) {
        return new Response(JSON.stringify(null), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      console.error('Get data error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (method === 'POST') {
    try {
      const body = await req.json();
      
      // Validate data structure
      if (!body || typeof body !== 'object') {
        return new Response(JSON.stringify({ error: 'Invalid data format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Save to Vercel Blob
      const jsonData = JSON.stringify(body);
      const blob = await put(blobKey, jsonData, {
        access: 'public',
        contentType: 'application/json',
      });

      return new Response(JSON.stringify({ success: true, url: blob.url }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Save data error:', error);
      return new Response(JSON.stringify({ error: 'Failed to save data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (method === 'DELETE') {
    try {
      // Find the blob first to get its URL
      const { blobs } = await list({
        prefix: blobKey,
        limit: 1,
      });
      
      if (blobs.length === 0) {
        // Already deleted
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Delete using the blob URL
      await del(blobs[0].url);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      // Ignore 404 errors (already deleted)
      if (error.status === 404 || error.message?.includes('not found')) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      console.error('Delete data error:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

