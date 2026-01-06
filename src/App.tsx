/**
 * Main App Component
 * 
 * Handles onboarding flow and main app navigation.
 * Manages PIN protection for edits.
 */

import { useState, useEffect } from 'react';
import { getAppData, getPINHash, savePayments } from './utils/db';
import { recalculateAllStatuses } from './utils/paymentStatus';
import { initializePayments } from './utils/paymentInitialization';
import { AppData } from './types';
import PINSetup from './components/PINSetup';
import LoanSetup from './components/LoanSetup';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import BottomNav from './components/BottomNav';
import PINModal from './components/PINModal';
import PaymentBottomSheet from './components/PaymentBottomSheet';

type AppView = 'onboarding-pin' | 'onboarding-loan' | 'main';
type MainView = 'dashboard' | 'calendar';

export default function App() {
  const [appView, setAppView] = useState<AppView>('onboarding-pin');
  const [mainView, setMainView] = useState<MainView>('dashboard');
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPINModal, setShowPINModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  // Load app data on mount
  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    try {
      const data = await getAppData();
      const pinHash = await getPINHash();

      if (!pinHash) {
        setAppView('onboarding-pin');
      } else if (!data?.loanDetails) {
        setAppView('onboarding-loan');
      } else {
        // Recalculate statuses and initialize payments if needed
        let payments = data.payments;
        
        // If no payments exist but loan details do, initialize them
        if (payments.length === 0 && data.loanDetails) {
          payments = initializePayments(data.loanDetails);
          await savePayments(payments);
        }

        // Recalculate all statuses
        payments = recalculateAllStatuses(payments);
        await savePayments(payments);

        setAppData({ ...data, payments });
        setAppView('main');
      }
    } catch (error) {
      console.error('Failed to load app data:', error);
      // Show error message but still allow onboarding
      alert('Failed to load data from cloud. Please check your internet connection.');
      // Allow user to proceed with onboarding if data fetch fails
      const pinHash = await getPINHash();
      if (!pinHash) {
        setAppView('onboarding-pin');
      } else {
        setAppView('onboarding-loan');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePINComplete = () => {
    setAppView('onboarding-loan');
  };

  const handleLoanComplete = async () => {
    const data = await getAppData();
    if (data?.loanDetails) {
      // Initialize payments
      const payments = initializePayments(data.loanDetails);
      await savePayments(payments);
      
      setAppData({ ...data, payments });
      setAppView('main');
    }
  };

  const handleWeekSelect = (weekStartDate: string) => {
    setSelectedWeek(weekStartDate);
    setShowPINModal(true);
  };

  const handlePINVerify = () => {
    setShowPINModal(false);
    setShowPaymentSheet(true);
  };

  const handlePaymentSave = async () => {
    // Reload app data to refresh payments
    await loadAppData();
    setShowPaymentSheet(false);
    setSelectedWeek(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Onboarding flows
  if (appView === 'onboarding-pin') {
    return <PINSetup onComplete={handlePINComplete} />;
  }

  if (appView === 'onboarding-loan') {
    return <LoanSetup onComplete={handleLoanComplete} />;
  }

  // Main app
  if (!appData?.loanDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">No loan data found. Please restart the app.</p>
      </div>
    );
  }

  const selectedPayment = selectedWeek
    ? appData.payments.find(p => p.weekStartDate === selectedWeek) || null
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {mainView === 'dashboard' && (
        <Dashboard loanDetails={appData.loanDetails} payments={appData.payments} />
      )}
      
      {mainView === 'calendar' && (
        <Calendar
          loanDetails={appData.loanDetails}
          payments={appData.payments}
          onWeekSelect={handleWeekSelect}
        />
      )}

      <BottomNav currentView={mainView} onViewChange={setMainView} />

      {/* PIN Modal for protected actions */}
      <PINModal
        isOpen={showPINModal}
        onVerify={handlePINVerify}
        onCancel={() => {
          setShowPINModal(false);
          setSelectedWeek(null);
        }}
        title="Enter PIN to Edit Payment"
        message="You need to enter your PIN to edit payment details."
      />

      {/* Payment Bottom Sheet */}
      {selectedWeek && (
        <PaymentBottomSheet
          isOpen={showPaymentSheet}
          weekStartDate={selectedWeek}
          payment={selectedPayment}
          loanDetails={appData.loanDetails}
          onClose={() => {
            setShowPaymentSheet(false);
            setSelectedWeek(null);
          }}
          onSave={handlePaymentSave}
        />
      )}
    </div>
  );
}

