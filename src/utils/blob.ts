/**
 * Vercel Blob Utilities
 * 
 * Handles receipt image upload and deletion via Vercel Blob
 */

/**
 * Upload receipt image to Vercel Blob
 * @param file - File object to upload
 * @param weekStartDate - Week start date for filename
 * @returns Promise resolving to blob URL
 */
export async function uploadReceipt(file: File, weekStartDate: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('weekStartDate', weekStartDate);

  const response = await fetch('/api/upload-receipt', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload receipt');
  }

  const data = await response.json();
  return data.url;
}

/**
 * Delete receipt image from Vercel Blob
 * @param url - Blob URL to delete
 */
export async function deleteReceipt(url: string): Promise<void> {
  // Only delete if it's a Vercel Blob URL (not base64)
  if (!url.startsWith('http')) {
    return; // Skip deletion for base64 images (backward compatibility)
  }

  const response = await fetch(`/api/delete-receipt?url=${encodeURIComponent(url)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete receipt');
  }
}

