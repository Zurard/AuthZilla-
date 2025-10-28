import React, { useEffect, useRef } from 'react';

export default function ErrorPage() {
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

      ctx.fillStyle = '#ff0000';
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

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-mono">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30"
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="cyber-panel bg-black border-2 border-[#ff0000] p-8 relative rounded-3xl">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-4 border-l-4 border-[#ff0000] rounded-tl-3xl"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-4 border-r-4 border-[#ff0000] rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-4 border-l-4 border-[#ff0000] rounded-bl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-4 border-r-4 border-[#ff0000] rounded-br-3xl"></div>

            <h1 className="text-3xl font-bold text-[#ff0000] mb-2 text-center tracking-wider">
              SYSTEM ERROR
            </h1>
            <div className="h-px bg-gradient-to-r from-transparent via-[#ff0000] to-transparent mb-6"></div>

            <p className="text-[#ff0000] text-center tracking-wide mb-8">
              ⚠ CONNECTION_ERROR
            </p>

            <div className="bg-black border-2 border-[#ff0000] p-4 rounded-2xl mb-6">
              <p className="text-[#ff0000] text-sm tracking-wide">
                Unable to connect to the authentication server.
              </p>
              <p className="text-[#ff0000] text-sm tracking-wide mt-3">
                Please verify your connection and try again.
              </p>
            </div>

            <p className="text-[#ff0000] text-xs text-center tracking-wider">
              SYSTEM_STATUS: <span className="animate-pulse">OFFLINE</span>
            </p>

            <style>{`
              .cyber-panel {
                position: relative;
                backdrop-filter: blur(10px);
              }

              .cyber-panel::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(45deg, transparent 48%, #ff0000 49%, #ff0000 51%, transparent 52%);
                background-size: 20px 20px;
                opacity: 0.03;
                pointer-events: none;
                border-radius: 1.5rem;
              }

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

              body {
                background: #000000;
                overflow-x: hidden;
              }
            `}</style>
          </div>

          <div className="mt-4 text-center text-[#330000] text-xs">
            <p className="animate-pulse-slow">ERROR_STATE_DETECTED</p>
          </div>
        </div>
      </div>
    </div>
  );
}
