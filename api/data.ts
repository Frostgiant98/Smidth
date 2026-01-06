/**
 * Vercel Serverless API Route
 * Get and save app data (loan details, payments, PIN hash)
 * Stores data in Vercel Blob keyed by user ID
 */

import { put, get, del } from '@vercel/blob';

export const config = {
  runtime: 'nodejs',
};

const BLOB_PREFIX = 'app-data/';

async function getBlobKey(userId: string): Promise<string> {
  return `${BLOB_PREFIX}${userId}.json`;
}

export default async function handler(req: Request) {
  const { method } = req;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const blobKey = await getBlobKey(userId);

  if (method === 'GET') {
    try {
      // Try to get existing data
      const blob = await get(blobKey);
      const data = await blob.text();
      return new Response(data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      // If blob doesn't exist, return null (first time user)
      if (error.status === 404 || error.message?.includes('not found')) {
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
      await put(blobKey, jsonData, {
        access: 'public',
        contentType: 'application/json',
      });

      return new Response(JSON.stringify({ success: true }), {
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
      await del(blobKey);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      // Ignore 404 errors (already deleted)
      if (error.status !== 404) {
        console.error('Delete data error:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete data' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

