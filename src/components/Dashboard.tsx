/**
 * Dashboard Component
 * 
 * Displays live metrics and overview of loan progress.
 * No PIN required for viewing.
 */

import { LoanDetails, WeeklyPayment } from '../types';
import { calculateMetrics } from '../utils/finance';

interface DashboardProps {
  loanDetails: LoanDetails;
  payments: WeeklyPayment[];
}

export default function Dashboard({ loanDetails, payments }: DashboardProps) {
  const metrics = calculateMetrics(loanDetails, payments);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-600">Progress</span>
          <span className="text-lg font-bold text-primary">{metrics.progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-primary h-4 rounded-full transition-all duration-300"
            style={{ width: `${metrics.progress}%` }}
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Principal</p>
          <p className="text-xl font-bold">{formatCurrency(loanDetails.principal)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Interest</p>
          <p className="text-xl font-bold">{formatCurrency(loanDetails.interestAmount)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Payable</p>
          <p className="text-xl font-bold">{formatCurrency(loanDetails.totalPayable)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Amount Paid</p>
          <p className="text-xl font-bold text-success">{formatCurrency(metrics.amountPaid)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Remaining</p>
          <p className="text-xl font-bold text-danger">{formatCurrency(metrics.remainingBalance)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Interest Rate</p>
          <p className="text-xl font-bold">{loanDetails.effectiveInterestRate.toFixed(2)}%</p>
        </div>
      </div>

      {/* Week Statistics */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Week Statistics</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-success">{metrics.paidWeeks}</p>
            <p className="text-sm text-gray-600 mt-1">Paid</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-danger">{metrics.missedWeeks}</p>
            <p className="text-sm text-gray-600 mt-1">Missed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{metrics.remainingWeeks}</p>
            <p className="text-sm text-gray-600 mt-1">Remaining</p>
          </div>
        </div>
      </div>

      {/* Loan Details Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Loan Details</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Weekly Installment:</span>
            <span className="font-semibold">{formatCurrency(loanDetails.weeklyInstallment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Total Duration:</span>
            <span className="font-semibold">~{loanDetails.loanDurationWeeks} weeks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Remaining Duration:</span>
            <span className="font-semibold">~{metrics.remainingWeeks} weeks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Start Date:</span>
            <span className="font-semibold">
              {new Date(loanDetails.loanStartDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

