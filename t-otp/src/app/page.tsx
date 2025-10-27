'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Terminal, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QrPage from './Components/qrCode';
import OtpVerification from './Components/OtpVerfication';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuth();

  const [currentView, setCurrentView] = useState<'login' | 'qr' | 'otp'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [terminalText, setTerminalText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [sharedSecret, setSharedSecret] = useState('');

  const terminalMessages = [
    '$ qrng-auth --initialize',
    'Loading quantum entropy modules...',
    'Establishing secure connection...',
    'Authentication terminal ready.',
    '',
    'Please enter your credentials below:',
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
          setTimeout(
            typeWriter,
            messageIndex === terminalMessages.length - 2 ? 1000 : 400
          );
        }
      } else {
        setIsTyping(false);
      }
    };
    typeWriter();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      const user = await login({ email, password });
      if (user) {
        console.log('Login successful:', user);
        // Store user data if remember me is checked
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        setCurrentView('qr');
      }
    } catch (error) {
      console.error('Authentication Error:', error);
    }
  };

  const handleQRSuccess = (secret: string) => {
    setSharedSecret(secret);
    setCurrentView('otp');
  };

  const handleOTPVerify = (otp: string) => {
    console.log('OTP verification:', otp);
    // Handle OTP verification logic here
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  if (currentView === 'otp') {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono p-4">
        <OtpVerification 
          sharedSecret={sharedSecret}
          onVerified={() => console.log('OTP verified successfully')}
          onFailed={() => console.log('OTP verification failed')}
          onBack={() => setCurrentView('qr')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-2xl mx-auto">
        {/* Terminal Header */}
        <div className="border border-green-400 mb-4">
          <div className="bg-green-400 text-black px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4" />
              <span className="font-bold">QRNG Authentication Terminal</span>
            </div>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-black border border-black"></div>
              <div className="w-3 h-3 bg-black border border-black"></div>
              <div className="w-3 h-3 bg-black border border-black"></div>
            </div>
          </div>

          <div>
            {currentView === 'qr' ? (
              <QrPage 
                email={email} 
                onQRGenerated={handleQRSuccess}
                onBack={handleBackToLogin}
              />
            ) : (
              <div className="p-6 min-h-[600px]">
                {/* Terminal Output */}
                <div className="mb-8">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {terminalText}
                    {isTyping && <span className="animate-pulse">█</span>}
                  </pre>
                </div>

                {/* Login Form */}
                {!isTyping && (
                  <div className="space-y-6">
                    {/* Error Message */}
                    {error && (
                      <div className="border border-red-400 bg-red-900/20 text-red-400 p-3 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Email Field */}
                      <div>
                        <div className="flex items-center mb-2">
                          <Mail className="w-4 h-4 mr-2" />
                          <label htmlFor="email" className="text-sm">
                            EMAIL:
                          </label>
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-black border border-green-400 px-3 py-2 text-green-400 focus:outline-none focus:border-green-300 placeholder-green-600"
                          placeholder="user@domain.com"
                          required
                        />
                      </div>

                      {/* Password Field */}
                      <div>
                        <div className="flex items-center mb-2">
                          <Lock className="w-4 h-4 mr-2" />
                          <label htmlFor="password" className="text-sm">
                            PASSWORD:
                          </label>
                        </div>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-green-400 px-3 py-2 pr-10 text-green-400 focus:outline-none focus:border-green-300 placeholder-green-600"
                            placeholder="••••••••••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="mr-2 accent-green-400"
                          />
                          Remember session
                        </label>
                        <button
                          type="button"
                          className="text-green-400 hover:text-green-300 underline"
                        >
                          Forgot password?
                        </button>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full border border-green-400 bg-black text-green-400 py-3 px-4 hover:bg-green-400 hover:text-black transition-colors duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
                          {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />}
                        </button>
                      </div>
                    </form>

                    {/* Alternative Options */}
                    <div className="pt-6 border-t border-green-400">
                      <div className="text-sm mb-4">Alternative authentication methods:</div>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="border border-green-400 bg-black text-green-400 py-2 px-4 hover:bg-green-400 hover:text-black transition-colors duration-200 text-sm">
                          QUANTUM KEY
                        </button>
                        <button className="border border-green-400 bg-black text-green-400 py-2 px-4 hover:bg-green-400 hover:text-black transition-colors duration-200 text-sm">
                          BIOMETRIC
                        </button>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 text-xs text-green-600">
                      <div>QRNG System v2.1.4 | Quantum Secure Authentication</div>
                      <div className="mt-1">
                        New user? <button className="text-green-400 hover:text-green-300 underline">Request access</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
