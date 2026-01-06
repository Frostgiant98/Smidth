/**
 * Payment Bottom Sheet Component
 * 
 * PIN-protected modal for editing payment details.
 * Allows marking payment, setting amount, and uploading receipts.
 */

import { useState, useRef, useEffect } from 'react';
import { WeeklyPayment, LoanDetails } from '../types';
import { formatDateISO, parseDateISO } from '../utils/dateUtils';
import { updatePayment } from '../utils/db';
import { calculatePaymentStatus } from '../utils/paymentStatus';
import { uploadReceipt, deleteReceipt } from '../utils/blob';

interface PaymentBottomSheetProps {
  isOpen: boolean;
  weekStartDate: string;
  payment: WeeklyPayment | null;
  loanDetails: LoanDetails;
  onClose: () => void;
  onSave: () => void;
}

export default function PaymentBottomSheet({
  isOpen,
  weekStartDate,
  payment,
  loanDetails,
  onClose,
  onSave,
}: PaymentBottomSheetProps) {
  const [amountPaid, setAmountPaid] = useState(
    payment?.amountPaid.toString() || loanDetails.weeklyInstallment.toString()
  );
  const [paymentDate, setPaymentDate] = useState(
    payment?.paymentDate || formatDateISO(parseDateISO(weekStartDate))
  );
  const [receiptImage, setReceiptImage] = useState<string | null>(payment?.receiptImage || null);
  const [isMarkingPaid, setIsMarkingPaid] = useState(!!payment?.paymentDate);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && payment) {
      setAmountPaid(payment.amountPaid.toString());
      setPaymentDate(payment.paymentDate || formatDateISO(parseDateISO(weekStartDate)));
      setReceiptImage(payment.receiptImage);
      setIsMarkingPaid(!!payment.paymentDate);
    } else if (isOpen) {
      setAmountPaid(loanDetails.weeklyInstallment.toString());
      setPaymentDate(formatDateISO(parseDateISO(weekStartDate)));
      setReceiptImage(null);
      setIsMarkingPaid(false);
    }
  }, [isOpen, payment, weekStartDate, loanDetails]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      alert('Please select a PNG or JPEG image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Vercel Blob
      const blobUrl = await uploadReceipt(file, weekStartDate);
      setReceiptImage(blobUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload receipt');
      // Fallback to base64 for offline/local development
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteReceipt = async () => {
    if (!receiptImage) return;

    // Delete from Vercel Blob if it's a URL
    if (receiptImage.startsWith('http')) {
      try {
        await deleteReceipt(receiptImage);
      } catch (error) {
        console.error('Delete error:', error);
        // Continue with local deletion even if blob delete fails
      }
    }

    setReceiptImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const amount = parseFloat(amountPaid);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const weekEndDate = formatDateISO(
      new Date(parseDateISO(weekStartDate).getTime() + 6 * 24 * 60 * 60 * 1000)
    );

    const updatedPayment: WeeklyPayment = {
      weekStartDate,
      weekEndDate,
      paymentDate: isMarkingPaid ? paymentDate : null,
      amountPaid: amount,
      receiptImage,
      status: calculatePaymentStatus({
        paymentDate: isMarkingPaid ? paymentDate : null,
        weekEndDate,
      }),
    };

    await updatePayment(weekStartDate, updatedPayment);
    onSave();
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      // Get all payments and remove this one
      const { getAppData, savePayments } = await import('../utils/db');
      const { recalculateAllStatuses } = await import('../utils/paymentStatus');
      const data = await getAppData();
      if (data) {
        let payments = data.payments.filter(p => p.weekStartDate !== weekStartDate);
        // Recalculate statuses after deletion
        payments = recalculateAllStatuses(payments);
        await savePayments(payments);
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Week {new Date(weekStartDate).toLocaleDateString()}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mark as Paid Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="font-semibold">Mark as Paid</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isMarkingPaid}
                onChange={(e) => setIsMarkingPaid(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Payment Date */}
          {isMarkingPaid && (
            <div>
              <label className="block text-sm font-semibold mb-2">Payment Date (Monday)</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {/* Amount Paid */}
          <div>
            <label className="block text-sm font-semibold mb-2">Amount Paid</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-lg"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Weekly installment: ₦{loanDetails.weeklyInstallment.toFixed(2)}
            </p>
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Receipt</label>
            {receiptImage ? (
              <div className="space-y-3">
                <img
                  src={receiptImage}
                  alt="Receipt"
                  className="w-full rounded-xl border-2 border-gray-200"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-xl font-semibold active:bg-gray-300"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteReceipt}
                    className="flex-1 py-3 px-4 bg-danger text-white rounded-xl font-semibold active:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-4 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold active:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : '+ Upload Receipt (PNG/JPEG, max 5MB)'}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {payment && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-4 px-6 bg-danger text-white rounded-xl font-semibold active:bg-red-600"
              >
                Delete Payment
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-4 px-6 bg-primary text-white rounded-xl font-semibold active:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

