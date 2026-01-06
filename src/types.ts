/**
 * Core data types for the Car Installment Tracker app
 */

export type PaymentStatus = 'PAID' | 'MISSED' | 'UPCOMING';

export interface WeeklyPayment {
  weekStartDate: string; // ISO date string (Monday)
  weekEndDate: string; // ISO date string (Sunday)
  status: PaymentStatus;
  paymentDate: string | null; // ISO date string (Monday) or null
  amountPaid: number;
  receiptImage: string | null; // Vercel Blob URL or base64 encoded image (for backward compatibility)
}

export interface LoanDetails {
  principal: number;
  interestAmount: number;
  effectiveInterestRate: number;
  totalPayable: number;
  weeklyInstallment: number;
  loanDurationWeeks: number;
  loanStartDate: string; // ISO date string (Monday)
}

export interface AppData {
  loanDetails: LoanDetails | null;
  payments: WeeklyPayment[];
  pinHash: string | null;
}

export type InterestInputType = 'rate' | 'total';

