/**
 * Payment Status Calculation Logic
 * 
 * Determines payment status based on:
 * - Whether payment exists (PAID)
 * - Whether week has passed without payment (MISSED)
 * - Whether week is upcoming (UPCOMING)
 */

import { WeeklyPayment, PaymentStatus } from '../types';
import { parseDateISO, getSunday } from './dateUtils';

/**
 * Calculate payment status for a week
 * @param payment - The payment object (may be partial)
 * @param today - Today's date (defaults to now)
 * @returns PaymentStatus
 */
export function calculatePaymentStatus(
  payment: Partial<WeeklyPayment> | null,
  today: Date = new Date()
): PaymentStatus {
  // If payment exists with paymentDate, it's PAID
  if (payment?.paymentDate) {
    return 'PAID';
  }

  // If no payment but week has ended, it's MISSED
  if (payment?.weekEndDate) {
    const weekEnd = parseDateISO(payment.weekEndDate);
    if (today > weekEnd) {
      return 'MISSED';
    }
  }

  // Otherwise, it's UPCOMING
  return 'UPCOMING';
}

/**
 * Recalculate status for all payments
 */
export function recalculateAllStatuses(payments: WeeklyPayment[]): WeeklyPayment[] {
  const today = new Date();
  
  return payments.map(payment => ({
    ...payment,
    status: calculatePaymentStatus(payment, today),
  }));
}

