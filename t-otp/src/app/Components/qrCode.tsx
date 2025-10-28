import { useEffect, useState, useRef } from "react";
import OtpVerification from "./OtpVerfication";

interface QrPageProps {
  email: string;
  onBack?: () => void;
  onQRGenerated?: (secret: string) => void;
}

const QrPage: React.FC<QrPageProps> = ({ email, onBack, onQRGenerated }) => {
  const [qr, setQr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [sharedSecret, setSharedSecret] = useState<string>('');
  const [showOTPVerification, setShowOTPVerification] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        console.log('Fetching QR code for email:', email);
        setLoading(true);
        setError("");
        
        const response = await fetch('http://127.0.0.1:5000/generate_qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),  
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to generate QR code`);
        }

        const data = await response.json();
        setQr(data.qr);
        setSharedSecret(data.shared_secret);
        setShowOTPVerification(true);
      } catch (error) {
        console.error('Error fetching QR code:', error);
        setError(error instanceof Error ? error.message : 'Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchQRCode();
    }
  }, [email]);

  const handleRetry = () => {
    setError("");
    setQr("");
    setLoading(true);
    
    const fetchQRCode = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/generate_qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to generate QR code`);
        }

        const data = await response.json();
        setQr(data.qr);
        setSharedSecret(data.shared_secret);
      } catch (error) {
        console.error('Error fetching QR code:', error);
        setError(error instanceof Error ? error.message : 'Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-mono">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30"
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl">
          {loading && (
            <div className="bg-black border-2 border-[#00ff41] p-4 mb-6 text-[#00ff41] text-center rounded-2xl">
              <p className="animate-pulse">GENERATING_QR_CODE...</p>
            </div>
          )}

          {error && (
            <div className="bg-black border-2 border-[#ff0000] p-3 mb-6 text-[#ff0000] text-sm animate-pulse-slow rounded-2xl">
              <span className="inline-block mr-2">⚠</span>
              {error}
              <button 
                onClick={handleRetry}
                className="block mt-3 w-full bg-black border-2 border-[#ff0000] text-[#ff0000] py-2 hover:bg-[#ff0000] hover:text-black transition-all duration-300 rounded-lg"
              >
                RETRY
              </button>
            </div>
          )}

          {qr && !loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-fit">
              {/* Left Panel - QR Code */}
              <div className="cyber-panel bg-black border-2 border-[#00ff41] p-8 relative rounded-3xl flex flex-col">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-4 border-l-4 border-[#00ff41] rounded-tl-3xl"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-4 border-r-4 border-[#00ff41] rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-4 border-l-4 border-[#00ff41] rounded-bl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-4 border-r-4 border-[#00ff41] rounded-br-3xl"></div>

                <h1 className="text-3xl font-bold text-[#00ff41] mb-2 text-center tracking-wider">
                  QR CODE GENERATOR
                </h1>
                <div className="h-px bg-gradient-to-r from-transparent via-[#00ff41] to-transparent mb-6"></div>

                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="flex justify-center">
                    <div className="border-2 border-[#00ff41] p-4 rounded-2xl">
                      <img 
                        src={qr} 
                        alt="Authentication QR Code" 
                        className="w-56 h-56"
                      />
                    </div>
                  </div>

                  <div className="text-center w-full">
                    <p className="text-[#00ff41] font-bold tracking-wider">QR_CODE_READY</p>
                  </div>

                  <div className="border-t border-[#003300] pt-4 w-full">
                    <h3 className="text-[#00ff41] font-bold mb-2 tracking-wider text-sm">INSTRUCTIONS:</h3>
                    <ul className="space-y-1 text-[#00ff41] text-xs">
                      <li className="flex items-center"><span className="mr-2">→</span>Open authenticator app</li>
                      <li className="flex items-center"><span className="mr-2">→</span>Scan QR code</li>
                      <li className="flex items-center"><span className="mr-2">→</span>Enter generated code</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={handleRetry}
                    className="flex-1 bg-black border-2 border-[#00ff41] text-[#00ff41] py-2 font-bold tracking-wider hover:bg-[#00ff41] hover:text-black transition-all duration-300 rounded-lg text-sm"
                  >
                    REGENERATE
                  </button>

                  {onBack && (
                    <button 
                      onClick={onBack}
                      className="flex-1 bg-black border-2 border-[#00ff41] text-[#00ff41] py-2 font-bold tracking-wider hover:bg-[#00ff41] hover:text-black transition-all duration-300 rounded-lg text-sm"
                    >
                      BACK
                    </button>
                  )}
                </div>
              </div>

              {/* Right Panel - OTP Verification */}
              {showOTPVerification && sharedSecret && (
                <div className="cyber-panel bg-black border-2 border-[#00ff41] p-8 relative rounded-3xl flex flex-col">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-4 border-l-4 border-[#00ff41] rounded-tl-3xl"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-4 border-r-4 border-[#00ff41] rounded-tr-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-4 border-l-4 border-[#00ff41] rounded-bl-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-4 border-r-4 border-[#00ff41] rounded-br-3xl"></div>

                  <h1 className="text-3xl font-bold text-[#00ff41] mb-2 text-center tracking-wider">
                    OTP VERIFICATION
                  </h1>
                  <div className="h-px bg-gradient-to-r from-transparent via-[#00ff41] to-transparent mb-6"></div>

                  <div className="flex-1 flex flex-col justify-between">
                    <OtpVerification 
                      sharedSecret={sharedSecret}
                      onVerified={() => {
                        console.log('OTP verified successfully');
                        if (onQRGenerated) {
                          onQRGenerated(sharedSecret);
                        }
                      }}
                      onFailed={() => console.log('OTP verification failed')}
                      onBack={() => setShowOTPVerification(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 text-center text-[#003300] text-xs">
            <p className="animate-pulse-slow">SYSTEM_STATUS: <span className="text-[#00ff41]">OPERATIONAL</span></p>
          </div>
        </div>
      </div>

      <style>{`
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

        body {
          background: #000000;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
};

export default QrPage;