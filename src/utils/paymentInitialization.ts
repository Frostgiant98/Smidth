/**
 * Payment Initialization Utilities
 * 
 * Creates initial payment entries when loan is set up.
 */

import { LoanDetails, WeeklyPayment } from '../types';
import { getWeekMondays, formatDateISO, parseDateISO } from './dateUtils';
import { calculatePaymentStatus } from './paymentStatus';

/**
 * Initialize payment entries for all weeks in the loan
 */
export function initializePayments(loanDetails: LoanDetails): WeeklyPayment[] {
  const mondays = getWeekMondays(loanDetails.loanStartDate, loanDetails.loanDurationWeeks);
  const today = new Date();

  return mondays.map((monday) => {
    const weekStart = parseDateISO(monday);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const payment: WeeklyPayment = {
      weekStartDate: monday,
      weekEndDate: formatDateISO(weekEnd),
      status: calculatePaymentStatus(null, today),
      paymentDate: null,
      amountPaid: 0,
      receiptImage: null,
    };

    return payment;
  });
}

