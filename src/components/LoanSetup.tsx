/**
 * Loan Setup Component (Onboarding Step 2)
 * 
 * Collects loan details with two input modes:
 * - Interest Rate (%)
 * - Final Total Payable
 */

import { useState } from 'react';
import { InterestInputType } from '../types';
import { getMonday, formatDateISO } from '../utils/dateUtils';
import { calculateFromInterestRate, calculateFromTotalPayable } from '../utils/finance';
import { saveLoanDetails } from '../utils/db';

interface LoanSetupProps {
  onComplete: () => void;
}

export default function LoanSetup({ onComplete }: LoanSetupProps) {
  const [inputType, setInputType] = useState<InterestInputType>('rate');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [totalPayable, setTotalPayable] = useState('');
  const [weeklyInstallment, setWeeklyInstallment] = useState('');
  const [loanStartDate, setLoanStartDate] = useState(formatDateISO(getMonday()));
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const principalNum = parseFloat(principal);
    const weeklyInstallmentNum = parseFloat(weeklyInstallment);

    // Validation
    if (!principalNum || principalNum <= 0) {
      setError('Please enter a valid purchase price');
      return;
    }

    if (!weeklyInstallmentNum || weeklyInstallmentNum <= 0) {
      setError('Please enter a valid weekly installment amount');
      return;
    }

    if (!loanStartDate) {
      setError('Please select a loan start date');
      return;
    }

    // Ensure start date is Monday
    const startDate = getMonday(new Date(loanStartDate));
    const startDateISO = formatDateISO(startDate);

    try {
      let loanDetails;

      if (inputType === 'rate') {
        const rateNum = parseFloat(interestRate);
        if (!rateNum || rateNum < 0) {
          setError('Please enter a valid interest rate');
          return;
        }
        loanDetails = calculateFromInterestRate(
          principalNum,
          rateNum,
          weeklyInstallmentNum,
          startDateISO
        );
      } else {
        const totalPayableNum = parseFloat(totalPayable);
        if (!totalPayableNum || totalPayableNum <= principalNum) {
          setError('Total payable must be greater than purchase price');
          return;
        }
        loanDetails = calculateFromTotalPayable(
          principalNum,
          totalPayableNum,
          weeklyInstallmentNum,
          startDateISO
        );
      }

      await saveLoanDetails(loanDetails);
      onComplete();
    } catch (err) {
      setError('Failed to save loan details. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h1 className="text-3xl font-bold mb-2 text-center">Loan Details</h1>
          <p className="text-gray-600 text-center mb-8">Enter your car loan information</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Principal */}
            <div>
              <label className="block text-sm font-semibold mb-2">Car Purchase Price</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full py-4 px-4 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-lg"
                placeholder="0.00"
                required
              />
            </div>

            {/* Interest Input Type Toggle */}
            <div>
              <label className="block text-sm font-semibold mb-3">Interest Input Method</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setInputType('rate');
                    setTotalPayable('');
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold ${
                    inputType === 'rate'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Interest Rate (%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputType('total');
                    setInterestRate('');
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold ${
                    inputType === 'total'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Total Payable
                </button>
              </div>
            </div>

            {/* Interest Rate or Total Payable */}
            {inputType === 'rate' ? (
              <div>
                <label className="block text-sm font-semibold mb-2">Interest Rate (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full py-4 px-4 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-lg"
                  placeholder="0.00"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold mb-2">Final Total Payable</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={totalPayable}
                  onChange={(e) => setTotalPayable(e.target.value)}
                  className="w-full py-4 px-4 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-lg"
                  placeholder="0.00"
                  required
                />
              </div>
            )}

            {/* Weekly Installment */}
            <div>
              <label className="block text-sm font-semibold mb-2">Weekly Installment Amount</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={weeklyInstallment}
                onChange={(e) => setWeeklyInstallment(e.target.value)}
                className="w-full py-4 px-4 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-lg"
                placeholder="0.00"
                required
              />
            </div>

            {/* Loan Start Date */}
            <div>
              <label className="block text-sm font-semibold mb-2">Loan Start Date (Monday)</label>
              <input
                type="date"
                value={loanStartDate}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  const monday = getMonday(selectedDate);
                  setLoanStartDate(formatDateISO(monday));
                }}
                className="w-full py-4 px-4 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-lg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Will be adjusted to the nearest Monday</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 px-6 bg-primary text-white rounded-xl font-semibold text-lg active:bg-blue-600"
            >
              Complete Setup
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

