/**
 * IndexedDB Database Utilities
 * 
 * Stores all app data locally using IndexedDB for persistence.
 * Handles loan details, payments, and PIN hash.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { AppData, LoanDetails, WeeklyPayment } from '../types';

interface CarTrackerDB extends DBSchema {
  appData: {
    key: string;
    value: AppData;
  };
}

const DB_NAME = 'car-installment-tracker';
const DB_VERSION = 1;
const STORE_NAME = 'appData';

let dbInstance: IDBPDatabase<CarTrackerDB> | null = null;

/**
 * Initialize and return database instance
 */
export async function getDB(): Promise<IDBPDatabase<CarTrackerDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<CarTrackerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });

  return dbInstance;
}

/**
 * Get all app data
 */
export async function getAppData(): Promise<AppData | null> {
  const db = await getDB();
  const data = await db.get(STORE_NAME, 'data');
  return data || null;
}

/**
 * Save app data
 */
export async function saveAppData(data: AppData): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, data, 'data');
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

