/**
 * Vercel Serverless API Route
 * Upload receipt image to Vercel Blob
 */

import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const weekStartDate = formData.get('weekStartDate') as string;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!weekStartDate) {
      return new Response(JSON.stringify({ error: 'No weekStartDate provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Only PNG/JPEG allowed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large. Max 5MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate unique filename
    const filename = `receipts/${weekStartDate}-${Date.now()}.${file.type.split('/')[1]}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return new Response(JSON.stringify({ url: blob.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload receipt' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

