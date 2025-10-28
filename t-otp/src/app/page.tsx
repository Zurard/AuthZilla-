'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createUser } from './actions /users';
import { getUserByEmail } from './actions /users';
import { getPasswordByEmail } from './actions /users';
import QRCode from './Components/qrCode';

export default function App() {
  const [currentView, setCurrentView] = useState<'login' | 'qr'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // ... your existing canvas matrix effect (no changes) ...
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Attempting login for:', email);
    setLoading(true);

    try {
      const user = await getUserByEmail(email);
      if (user) {
        console.log('User found:', user);
        const storedPassword = await getPasswordByEmail(email);
        if (storedPassword === password) {
          console.log('Login successful');
          setLoading(false);
          setCurrentView('qr');
        } else {
          console.log('Invalid password');
          setError('Invalid password');
          setLoading(false);
        }
        return;
      } else {
        await createUser(email, password);
        console.log('User created, navigating to QR code');
        setLoading(false);
        setCurrentView('qr');
        return;
      }        
    } catch (err) {
      console.error(err);
      setError('Authentication failed. Please try again.');
      setLoading(false);
    }
  };  
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-mono">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30"
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {currentView === 'login' ? (
          <div className="w-full max-w-md">
            {/* ... Your existing login form (no changes) ... */}
            <div className="cyber-panel bg-black border-2 border-[#00ff41] p-8 relative rounded-3xl">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-4 border-l-4 border-[#00ff41] rounded-tl-3xl"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-4 border-r-4 border-[#00ff41] rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-4 border-l-4 border-[#00ff41] rounded-bl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-4 border-r-4 border-[#00ff41] rounded-br-3xl"></div>

              <h1 className="text-3xl font-bold text-[#00ff41] mb-2 text-center tracking-wider">
                AUTHENTICATION SYSTEM
              </h1>
              <div className="h-px bg-gradient-to-r from-transparent via-[#00ff41] to-transparent mb-6"></div>

              {error && (
                <div className="bg-black border-2 border-[#ff0000] p-3 mb-6 text-[#ff0000] text-sm animate-pulse-slow rounded-2xl">
                  <span className="inline-block mr-2">⚠</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-[#00ff41] text-sm mb-2 tracking-wide">
                    EMAIL_ADDRESS:
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-black border-2 border-[#00ff41] text-[#00ff41] px-4 py-3 focus:outline-none focus:border-[#00ff88] transition-all duration-300 cyber-input rounded-xl"
                    placeholder="user@system.net"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-[#00ff41] text-sm mb-2 tracking-wide">
                    PASSWORD:
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-black border-2 border-[#00ff41] text-[#00ff41] px-4 py-3 pr-24 focus:outline-none focus:border-[#00ff88] transition-all duration-300 cyber-input rounded-xl"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00ff41] border border-[#00ff41] px-3 py-1 text-xs hover:bg-[#00ff41] hover:text-black transition-all duration-200 rounded-lg"
                    >
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 bg-black border-2 border-[#00ff41] checked:bg-[#00ff41] focus:outline-none cursor-pointer rounded"
                  />
                  <label htmlFor="remember" className="text-[#00ff41] text-sm cursor-pointer hover:text-[#00ff88] transition-colors">
                    REMEMBER_SESSION
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black border-2 border-[#00ff41] text-[#00ff41] py-3 font-bold tracking-wider hover:bg-[#00ff41] hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center">
                      <span className="animate-pulse">AUTHENTICATING</span>
                      <span className="ml-2 animate-ping">...</span>
                    </span>
                  ) : (
                    'AUTHENTICATE'
                  )}
                </button>
              </form>


              <div className="mt-6 pt-4 border-t border-[#003300] text-center">
                <p className="text-[#003300] text-xs tracking-wider">
                  SYSTEM_STATUS: <span className="text-[#00ff41] animate-pulse">ONLINE</span>
                </p>
              </div>
            </div>

            <div className="mt-4 text-center text-[#003300] text-xs">
              <p className="animate-pulse-slow">SECURE_CONNECTION_ESTABLISHED</p>
            </div>
          </div>
        ) : (
          
          // --- QR CODE & OTP VERIFICATION VIEW ---
          <QRCode 
            email={email} 
            onQRGenerated={() => {
              console.log('Authentication Complete!');
              // Handle successful verification
              alert('Authentication Successful! Redirecting...');
              setCurrentView('login');
              setEmail('');
              setPassword('');
            }}
            onBack={() => setCurrentView('login')}
          />
        )}
      </div>

      <style>{`
        /* ... your existing styles (no changes) ... */
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .cyber-panel {
          position: relative;
          backdrop-filter: blur(10px);
        }

        .cyber-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent 48%, #00ff41 49%, #00ff41 51%, transparent 52%);
          background-size: 20px 20px;
          opacity: 0.03;
          pointer-events: none;
          border-radius: 1.5rem;
        }

        .cyber-input {
          font-family: 'Courier New', monospace;
          letter-spacing: 0.05em;
        }

        .cyber-input::placeholder {
          color: #003300;
        }

        input[type="checkbox"]:checked {
          background-color: #00ff41;
          background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
        }

        body {
          background: #000000;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}