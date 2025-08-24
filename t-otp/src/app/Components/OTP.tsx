import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, Terminal } from 'lucide-react';

interface OTPVerificationProps {
  onBack: () => void;
  onVerify: (otp: string) => void;
}

function OTPVerification({ onBack, onVerify }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [terminalText, setTerminalText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const terminalMessages = [
    '$ qrng-auth --verify-otp',
    'Initializing quantum verification protocol...',
    'Generating secure OTP challenge...',
    'OTP sent to registered device.',
    '',
    'Enter the 6-digit verification code:'
  ];

  useEffect(() => {
    let messageIndex = 0;
    let charIndex = 0;
    let currentMessage = '';

    const typeWriter = () => {
      if (messageIndex < terminalMessages.length) {
        if (charIndex < terminalMessages[messageIndex].length) {
          currentMessage += terminalMessages[messageIndex][charIndex];
          setTerminalText(currentMessage);
          charIndex++;
          setTimeout(typeWriter, 30);
        } else {
          currentMessage += '\n';
          setTerminalText(currentMessage);
          messageIndex++;
          charIndex = 0;
          setTimeout(typeWriter, messageIndex === terminalMessages.length - 2 ? 1000 : 400);
        }
      } else {
        setIsTyping(false);
      }
    };

    typeWriter();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length === 6) {
      onVerify(otpString);
    }
  };

  const handleResendOTP = () => {
    setTimeLeft(300);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-2xl mx-auto">
        {/* Terminal Header */}
        <div className="border border-green-400 mb-4">
          <div className="bg-green-400 text-black px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4" />
              <span className="font-bold">QRNG OTP Verification Terminal</span>
            </div>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-black border border-black"></div>
              <div className="w-3 h-3 bg-black border border-black"></div>
              <div className="w-3 h-3 bg-black border border-black"></div>
            </div>
          </div>
          
          {/* Terminal Content */}
          <div className="p-6 min-h-[600px]">
            {/* Terminal Output */}
            <div className="mb-8">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {terminalText}
                {isTyping && <span className="animate-pulse">█</span>}
              </pre>
            </div>

            {/* OTP Form */}
            {!isTyping && (
              <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* OTP Input Fields */}
                  <div>
                    <div className="text-sm mb-4">
                      VERIFICATION_CODE:
                    </div>
                    <div className="flex justify-center space-x-3 mb-4">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { inputRefs.current[index] = el }}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-12 h-12 bg-black border border-green-400 text-center text-xl text-green-400 focus:outline-none focus:border-green-300"
                          autoComplete="off"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="text-center text-sm">
                    <div className="mb-2">
                      CODE_EXPIRES_IN: {formatTime(timeLeft)}
                    </div>
                    {timeLeft === 0 && (
                      <div className="text-red-400">
                        {"> "}Code expired. Please request a new one.
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={otp.join('').length !== 6 || timeLeft === 0}
                      className="w-full border border-green-400 bg-black text-green-400 py-3 px-4 hover:bg-green-400 hover:text-black transition-colors duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-green-400"
                    >
                      VERIFY_CODE
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </form>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleResendOTP}
                    disabled={timeLeft > 240} // Can resend after 1 minute
                    className="w-full border border-green-400 bg-black text-green-400 py-2 px-4 hover:bg-green-400 hover:text-black transition-colors duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-green-400"
                  >
                    <RotateCcw className="mr-2 w-4 h-4" />
                    RESEND_CODE
                    {timeLeft > 240 && (
                      <span className="ml-2 text-xs">
                        (available in {formatTime(300 - timeLeft)})
                      </span>
                    )}
                  </button>

                  <button
                    onClick={onBack}
                    className="w-full border border-green-400 bg-black text-green-400 py-2 px-4 hover:bg-green-400 hover:text-black transition-colors duration-200 flex items-center justify-center group"
                  >
                    <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    BACK_TO_LOGIN
                  </button>
                </div>

                {/* Help Text */}
                <div className="pt-6 border-t border-green-400">
                  <div className="text-sm mb-4">TROUBLESHOOTING:</div>
                  <div className="text-xs text-green-600 space-y-1">
                    <div>{"> "}Check your registered device for the 6-digit code</div>
                    <div>{"> "}Code is valid for 5 minutes</div>
                    <div>{"> "}Contact admin if code not received</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-6 text-xs text-green-600">
                  <div>QRNG System v2.1.4 | Quantum OTP Verification</div>
                  <div className="mt-1">
                    Need help? <button className="text-green-400 hover:text-green-300 underline">Contact support</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OTPVerification;