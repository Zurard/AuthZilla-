'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QrPage from './Components/qrCode';

export default function Home() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [terminalText, setTerminalText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showQR, setShowQR] = useState(false);

  console.log(showQR)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setShowQR(true);
    } catch (error) {
      console.error('Authentication Error:', error);
    }
  };

  return (
    <div className="min-h-screen mt-[50px] bg-black text-green-400 font-mono p-4">
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
            {showQR ? (
              <QrPage email={email}/>
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

                      {/* Submit Button */}
                      <div className="pt-4">
                        <button
                          type="submit"
                          className="w-full border border-green-400 bg-black text-green-400 py-3 px-4 hover:bg-green-400 hover:text-black transition-colors duration-200 flex items-center justify-center group"
                        >
                          AUTHENTICATE
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </button>
                      </div>
                    </form>
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
