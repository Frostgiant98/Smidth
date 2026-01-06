/**
 * Financial Calculation Utilities
 * 
 * Handles loan calculations with two input modes:
 * 1. Interest Rate (%)
 * 2. Final Total Payable
 */

import { LoanDetails } from '../types';

/**
 * Calculate loan details from principal and interest rate
 */
export function calculateFromInterestRate(
  principal: number,
  interestRate: number,
  weeklyInstallment: number,
  loanStartDate: string
): LoanDetails {
  const interestAmount = principal * (interestRate / 100);
  const totalPayable = principal + interestAmount;
  const effectiveInterestRate = interestRate;
  const loanDurationWeeks = Math.ceil(totalPayable / weeklyInstallment);

  return {
    principal,
    interestAmount,
    effectiveInterestRate,
    totalPayable,
    weeklyInstallment,
    loanDurationWeeks,
    loanStartDate,
  };
}

/**
 * Calculate loan details from principal and final total payable
 */
export function calculateFromTotalPayable(
  principal: number,
  totalPayable: number,
  weeklyInstallment: number,
  loanStartDate: string
): LoanDetails {
  const interestAmount = totalPayable - principal;
  const effectiveInterestRate = (interestAmount / principal) * 100;
  const loanDurationWeeks = Math.ceil(totalPayable / weeklyInstallment);

  return {
    principal,
    interestAmount,
    effectiveInterestRate,
    totalPayable,
    weeklyInstallment,
    loanDurationWeeks,
    loanStartDate,
  };
}

/**
 * Calculate dashboard metrics from loan and payments
 */
export function calculateMetrics(
  loanDetails: LoanDetails,
  payments: { amountPaid: number; status: string }[]
) {
  const amountPaid = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const remainingBalance = loanDetails.totalPayable - amountPaid;
  const progress = (amountPaid / loanDetails.totalPayable) * 100;

  const paidWeeks = payments.filter(p => p.status === 'PAID').length;
  const missedWeeks = payments.filter(p => p.status === 'MISSED').length;
  const remainingWeeksRaw = loanDetails.weeklyInstallment > 0
    ? Math.ceil(remainingBalance / loanDetails.weeklyInstallment)
    : 0;
  const remainingWeeks = Math.max(0, remainingWeeksRaw);

  return {
    amountPaid,
    remainingBalance,
    progress: Math.min(100, Math.max(0, progress)),
    paidWeeks,
    missedWeeks,
    remainingWeeks,
  };
}

