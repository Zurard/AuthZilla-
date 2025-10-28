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

const verifyOtp = async () => {
    try {
      setIsVerified(null); 
      
      // --- START: THE FIX ---
      // We will call your Python API endpoint instead of verifying locally
      const response = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the OTP code and the secret to the server
        body: JSON.stringify({
          otp: otpCode,       // The 6-digit code from the user
          secret: sharedSecret  // The Base64 secret you got from /generate_qr
        }),
      });

      const data = await response.json();

      // The server will respond with { "valid": true } or { "valid": false }
      if (response.ok && data.valid) {
        setIsVerified(true);
        setTimeout(() => {
          onVerified && onVerified();
        }, 1500);
      } else {
        // This will catch both network errors and a "valid: false" response
        setIsVerified(false);
        onFailed && onFailed();
      }
      // --- END: THE FIX ---

    } catch (error) {
      // This catches a network failure (e.g., server is down)
      console.error('Error calling verify API:', error);
      setIsVerified(false);
      onFailed && onFailed();
    }
  };

  // --- MODIFIED: Removed full-screen wrappers ---
  return (
    <div className="w-full h-full flex flex-col">
      {/* Form Content - without extra panel */}
      <div className="space-y-4 flex flex-col">
        <div>
          <label htmlFor="otp" className="block text-[#00ff41] text-sm mb-2 tracking-wide">
            ENTER_6_DIGIT_CODE:
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full bg-black border-2 border-[#00ff41] text-[#00ff41] px-4 py-3 focus:outline-none focus:border-[#00ff88] transition-all duration-300 cyber-input rounded-xl text-center text-2xl tracking-widest"
          />
        </div>

        <button 
          onClick={verifyOtp}
          disabled={otpCode.length < 6 || isVerified === true}
          className="w-full bg-black border-2 border-[#00ff41] text-[#00ff41] py-3 font-bold tracking-wider hover:bg-[#00ff41] hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] rounded-xl"
        >
          {isVerified === true ? 'VERIFIED ✓' : 'VERIFY_CODE'}
        </button>

        {isVerified === true && (
          <div className="bg-black border-2 border-[#00ff41] p-4 text-[#00ff41] text-center rounded-2xl animate-pulse-slow">
            <span className="inline-block mr-2">✓</span>
            VERIFICATION_SUCCESSFUL
          </div>
        )}
        
        {isVerified === false && (
          <div className="bg-black border-2 border-[#ff0000] p-4 text-[#ff0000] text-center rounded-2xl animate-pulse-slow">
            <span className="inline-block mr-2">✗</span>
            INVALID_CODE_TRY_AGAIN
          </div>
        )}

        {onBack && (
          <button 
            onClick={onBack}
            className="w-full bg-black border-2 border-[#003300] text-[#003300] py-2 font-bold tracking-wider hover:border-[#ff0000] hover:text-[#ff0000] transition-all duration-300 rounded-lg mt-2"
          >
            BACK_TO_LOGIN
          </button>
        )}
      </div>
    </div>
  );
};

export default OtpVerification;