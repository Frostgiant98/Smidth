/**
 * Calendar Component
 * 
 * Monday-locked weekly grid showing payment status.
 * Only Mondays are selectable.
 * Past weeks editable after PIN validation.
 */

import { LoanDetails, WeeklyPayment } from '../types';
import { getWeekMondays, parseDateISO, getWeekNumber } from '../utils/dateUtils';
import { PaymentStatus } from '../types';

interface CalendarProps {
  loanDetails: LoanDetails;
  payments: WeeklyPayment[];
  onWeekSelect: (weekStartDate: string) => void;
}

export default function Calendar({ loanDetails, payments, onWeekSelect }: CalendarProps) {
  const mondays = getWeekMondays(loanDetails.loanStartDate, loanDetails.loanDurationWeeks);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getPaymentForWeek = (weekStartDate: string): WeeklyPayment | null => {
    return payments.find(p => p.weekStartDate === weekStartDate) || null;
  };

  const getStatusColor = (status: PaymentStatus): string => {
    switch (status) {
      case 'PAID':
        return 'bg-success text-white';
      case 'MISSED':
        return 'bg-danger text-white';
      case 'UPCOMING':
        return 'bg-gray-200 text-gray-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getStatusIcon = (status: PaymentStatus): string => {
    switch (status) {
      case 'PAID':
        return '✓';
      case 'MISSED':
        return '✗';
      case 'UPCOMING':
        return '○';
      default:
        return '○';
    }
  };

  const isFutureWeek = (weekStartDate: string): boolean => {
    const weekStart = parseDateISO(weekStartDate);
    return today < weekStart;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Payment Calendar</h2>
      
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success"></div>
            <span>Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-danger"></div>
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200"></div>
            <span>Upcoming</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {mondays.map((monday) => {
          const payment = getPaymentForWeek(monday);
          const status = payment?.status || 'UPCOMING';
          const weekNum = getWeekNumber(monday, loanDetails.loanStartDate);
          const isFuture = isFutureWeek(monday);

          return (
            <button
              key={monday}
              onClick={() => onWeekSelect(monday)}
              className={`
                relative p-4 rounded-xl font-semibold text-center
                ${getStatusColor(status)}
                active:scale-95 transition-transform
                ${isFuture ? 'opacity-60' : ''}
              `}
            >
              <div className="text-xs mb-1">Week {weekNum + 1}</div>
              <div className="text-lg mb-1">{getStatusIcon(status)}</div>
              <div className="text-xs opacity-90">
                {new Date(monday).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              {payment?.amountPaid && (
                <div className="text-xs mt-1 opacity-75">
                  ₦{payment.amountPaid.toFixed(0)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

