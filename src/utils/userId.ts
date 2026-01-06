/**
 * User ID Management
 * 
 * Generates and stores a unique user ID in localStorage.
 * This ID is used to identify the user's data in cloud storage.
 */

const USER_ID_KEY = 'car-tracker-user-id';

/**
 * Get or create a user ID
 * @returns User ID string
 */
export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    // Generate a unique ID (UUID-like format)
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
  // Generate a simple unique ID
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
}

/**
 * Clear user ID (for testing/reset purposes)
 */
export function clearUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
}

