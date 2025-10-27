// src/app/Components/OtpVerification.tsx
'use client';

import { useState, useEffect } from 'react';
import { authenticator } from 'otplib';

interface OtpVerificationProps {
  sharedSecret: string;
  onVerified?: () => void;
  onFailed?: () => void;
  onBack?: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ 
  sharedSecret, 
  onVerified, 
  onFailed,
  onBack
}) => {
  const [otpCode, setOtpCode] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(30);
  const [currentServerTime, setCurrentServerTime] = useState<number>(0);

  useEffect(() => {
    // Get server time to ensure synchronization
    const getServerTime = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/server-time');
        const data = await response.json();
        setCurrentServerTime(data.timestamp);
      } catch (error) {
        console.error('Error fetching server time:', error);
      }
    };

    getServerTime();
    
    // Update countdown timer
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          // Reset to 30 seconds when time is up
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const verifyOtp = async () => {
    try {
      // Local verification using otplib
      const isValid = authenticator.verify({
        token: otpCode,
        secret: sharedSecret
      });

      if (isValid) {
        setIsVerified(true);
        onVerified && onVerified();
      } else {
        setIsVerified(false);
        onFailed && onFailed();
      }

      // (Optional) You can also still verify with server if you want double check
      // const response = await fetch('http://127.0.0.1:5000/verify-otp', {...});
      // const result = await response.json();
      // setIsVerified(result.valid);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setIsVerified(false);
      onFailed && onFailed();
    }
  };

  return (
    <div className="p-4 border border-green-400 mt-4">
      <h2 className="text-lg mb-4">Enter Authentication Code</h2>
      
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="6-digit code"
          className="bg-black border border-green-400 text-green-400 p-2 focus:outline-none"
          maxLength={6}
        />
        <button 
          onClick={verifyOtp}
          className="bg-green-400 text-black px-4 py-2 hover:bg-green-500"
        >
          Verify
        </button>
      </div>
      
      {isVerified === true && (
        <div className="text-green-400 mt-2">Verification successful!</div>
      )}
      
      {isVerified === false && (
        <div className="text-red-500 mt-2">Invalid code. Please try again.</div>
      )}
      
      <div className="mt-2 text-sm">
        Code refreshes in: {remainingTime} seconds
      </div>
    </div>
  );
};

export default OtpVerification;
