/**
 * Vercel Serverless API Route
 * Delete receipt image from Vercel Blob
 */

import { del } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return new Response(JSON.stringify({ error: 'No URL provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete from Vercel Blob
    await del(url);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete receipt' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

