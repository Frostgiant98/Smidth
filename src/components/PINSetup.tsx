/**
 * PIN Setup Component (Onboarding Step 1)
 * 
 * Allows user to create and confirm a 4-6 digit PIN.
 */

import { useState, useRef, useEffect } from 'react';
import { hashPIN, validatePINFormat } from '../utils/pin';
import { savePINHash } from '../utils/db';

interface PINSetupProps {
  onComplete: () => void;
}

export default function PINSetup({ onComplete }: PINSetupProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePINFormat(pin)) {
      setError('PIN must be 4-6 digits');
      return;
    }

    setStep('confirm');
    setConfirmPin('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin !== confirmPin) {
      setError('PINs do not match');
      setConfirmPin('');
      return;
    }

    try {
      const pinHash = await hashPIN(pin);
      await savePINHash(pinHash);
      onComplete();
    } catch (err) {
      setError('Failed to save PIN. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">Secure Your Data</h1>
          <p className="text-gray-600 text-center mb-8">
            {step === 'create'
              ? 'Create a 4-6 digit PIN to protect your data'
              : 'Confirm your PIN'}
          </p>

          <form onSubmit={step === 'create' ? handleCreateSubmit : handleConfirmSubmit}>
            <div className="mb-6">
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={step === 'create' ? pin : confirmPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (step === 'create') {
                    setPin(value);
                  } else {
                    setConfirmPin(value);
                  }
                  setError('');
                }}
                className="w-full text-4xl text-center font-mono tracking-widest py-6 px-4 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
                placeholder="••••"
                autoFocus
              />
              {error && (
                <p className="text-danger text-sm mt-3 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                (step === 'create' ? pin.length < 4 : confirmPin.length < 4) ||
                (step === 'create' ? pin.length > 6 : confirmPin.length > 6)
              }
              className="w-full py-4 px-6 bg-primary text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed active:bg-blue-600"
            >
              {step === 'create' ? 'Continue' : 'Confirm & Continue'}
            </button>

            {step === 'confirm' && (
              <button
                type="button"
                onClick={() => {
                  setStep('create');
                  setConfirmPin('');
                  setError('');
                }}
                className="w-full mt-3 py-3 px-6 text-gray-600 font-medium"
              >
                ← Back
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

