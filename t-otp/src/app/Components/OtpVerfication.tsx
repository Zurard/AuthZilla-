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
      // Reset verification status on new attempt
      setIsVerified(null); 
      
      const isValid = authenticator.verify({
        token: otpCode,
        secret: sharedSecret
      });

      if (isValid) {
        setIsVerified(true);
        // Wait a moment before calling onVerified to show success message
        setTimeout(() => {
          onVerified && onVerified();
        }, 1500);
      } else {
        setIsVerified(false);
        onFailed && onFailed();
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
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