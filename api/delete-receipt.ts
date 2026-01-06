/**
 * Vercel Serverless API Route
 * Delete receipt image from Vercel Blob
 */

import { del } from '@vercel/blob';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: Request) {
  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Parse query parameters from req.url (handle both absolute and relative URLs)
    let url: string | null = null;
    
    try {
      const urlString = req.url;
      if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
        // Absolute URL
        const urlObj = new URL(urlString);
        url = urlObj.searchParams.get('url');
      } else {
        // Relative URL - manually parse query string
        const queryIndex = urlString.indexOf('?');
        if (queryIndex !== -1) {
          const queryString = urlString.substring(queryIndex + 1);
          const params = new URLSearchParams(queryString);
          url = params.get('url');
        }
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
      // Fallback: try to extract url from query string manually
      const match = req.url.match(/[?&]url=([^&]+)/);
      url = match ? decodeURIComponent(match[1]) : null;
    }

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

