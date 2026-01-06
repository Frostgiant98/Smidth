/**
 * PIN Modal Component
 * 
 * Shows PIN input for protected actions.
 * Supports retry and optional session unlock.
 */

import { useState, useEffect, useRef } from 'react';
import { verifyPIN } from '../utils/pin';
import { getPINHash } from '../utils/db';

interface PINModalProps {
  isOpen: boolean;
  onVerify: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export default function PINModal({ isOpen, onVerify, onCancel, title = 'Enter PIN', message }: PINModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const storedHash = await getPINHash();
      if (!storedHash) {
        setError('PIN not set. Please restart app.');
        setIsVerifying(false);
        return;
      }

      const isValid = await verifyPIN(pin, storedHash);
      if (isValid) {
        onVerify();
        setPin('');
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
        inputRef.current?.focus();
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 animate-slide-up">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {message && <p className="text-gray-600 mb-6">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setPin(value);
                setError('');
              }}
              className="w-full text-3xl text-center font-mono tracking-widest py-4 px-2 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
              placeholder="••••"
              autoFocus
            />
            {error && (
              <p className="text-danger text-sm mt-2 text-center">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 px-6 bg-gray-200 text-gray-800 rounded-xl font-semibold active:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pin.length < 4 || isVerifying}
              className="flex-1 py-4 px-6 bg-primary text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:bg-blue-600"
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

