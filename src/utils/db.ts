/**
 * Cloud Database Utilities
 * 
 * Stores all app data in Vercel Blob (cloud storage) for cross-device access.
 * Handles loan details, payments, and PIN hash.
 */

import { AppData, LoanDetails, WeeklyPayment } from '../types';
import { getUserId } from './userId';

/**
 * Get all app data from cloud storage
 */
export async function getAppData(): Promise<AppData | null> {
  try {
    const userId = getUserId();
    const response = await fetch(`/api/data?userId=${encodeURIComponent(userId)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching app data:', error);
    // Return null on error (first time user or network issue)
    return null;
  }
}

/**
 * Save app data to cloud storage
 */
export async function saveAppData(data: AppData): Promise<void> {
  try {
    const userId = getUserId();
    const response = await fetch(`/api/data?userId=${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save data');
    }
  } catch (error) {
    console.error('Error saving app data:', error);
    throw error;
  }
}

/**
 * Save PIN hash
 */
export async function savePINHash(pinHash: string): Promise<void> {
  const data = await getAppData() || { loanDetails: null, payments: [], pinHash: null };
  data.pinHash = pinHash;
  await saveAppData(data);
}

/**
 * Get PIN hash
 */
export async function getPINHash(): Promise<string | null> {
  const data = await getAppData();
  return data?.pinHash || null;
}

/**
 * Save loan details
 */
export async function saveLoanDetails(loanDetails: LoanDetails): Promise<void> {
  const data = await getAppData() || { loanDetails: null, payments: [], pinHash: null };
  data.loanDetails = loanDetails;
  await saveAppData(data);
}

/**
 * Save payments array
 */
export async function savePayments(payments: WeeklyPayment[]): Promise<void> {
  const data = await getAppData() || { loanDetails: null, payments: [], pinHash: null };
  data.payments = payments;
  await saveAppData(data);
}

/**
 * Update a single payment
 */
export async function updatePayment(weekStartDate: string, payment: Partial<WeeklyPayment>): Promise<void> {
  const data = await getAppData();
  if (!data) return;

  const index = data.payments.findIndex(p => p.weekStartDate === weekStartDate);
  if (index >= 0) {
    data.payments[index] = { ...data.payments[index], ...payment };
  } else {
    data.payments.push(payment as WeeklyPayment);
  }

  await savePayments(data.payments);
}

