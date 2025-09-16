import { useEffect, useState } from "react";
import { Terminal, QrCode, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

interface QrPageProps {
  email: string;
  onBack?: () => void;
}

const QrPage: React.FC<QrPageProps> = ({ email, onBack }) => {
  const [qr, setQr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [terminalText, setTerminalText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const terminalMessages = [
    '$ qrng-auth --generate-qr',
    'Initializing quantum secure QR generator...',
    'Establishing encrypted connection...',
    'Generating quantum-secured authentication token...',
    'QR code generation in progress...',
    '',
    'Scan the QR code below with your authenticator:'
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
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
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
      } catch (error) {
        console.error('Error fetching QR code:', error);
        setError(error instanceof Error ? error.message : 'Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    if (email && !isTyping) {
      fetchQRCode();
    }
  }, [email, isTyping]);

  const handleRetry = () => {
    setError("");
    setQr("");
    setLoading(true);
    
    // Re-fetch QR code
    const fetchQRCode = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/generate_qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to generate QR code`);
        }

        const data = await response.json();
        setQr(data.qr);
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
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
    <div className="max-w-2xl mx-auto">
      <div className="border border-green-400 mb-4">
        {/* ✅ Keep only one header, this terminal-style one */}
        <div className="bg-green-400 text-black px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4" />
            <span className="font-bold">QRNG QR Code Generator Terminal</span>
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

            {/* QR Code Section */}
            {!isTyping && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="border border-green-400 p-4">
                  <div className="text-sm mb-2">USER_EMAIL:</div>
                  <div className="text-green-300">{email}</div>
                </div>

                {/* QR Code Display */}
                <div className="border border-green-400 p-6">
                  <div className="flex items-center mb-4">
                    <QrCode className="w-4 h-4 mr-2" />
                    <span className="text-sm">QUANTUM_QR_CODE:</span>
                  </div>

                  <div className="flex flex-col items-center">
                    {loading && (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-64 h-64 border border-green-400 flex items-center justify-center">
                          <div className="text-center">
                            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                            <div className="text-sm">GENERATING...</div>
                            <div className="text-xs mt-1">Please wait</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-64 h-64 border border-red-400 flex items-center justify-center">
                          <div className="text-center text-red-400">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                            <div className="text-sm">ERROR</div>
                            <div className="text-xs mt-1 px-4">{error}</div>
                          </div>
                        </div>
                        <button
                          onClick={handleRetry}
                          className="border border-green-400 bg-black text-green-400 py-2 px-4 hover:bg-green-400 hover:text-black transition-colors duration-200 flex items-center"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          RETRY_GENERATION
                        </button>
                      </div>
                    )}

                    {qr && !loading && !error && (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="border border-green-400 p-4 bg-white">
                          <img 
                            src={qr} 
                            alt="Authentication QR Code" 
                            className="w-64 h-64"
                          />
                        </div>
                        <div className="flex items-center text-green-300">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">QR_CODE_READY</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                {qr && !loading && !error && (
                  <div className="border border-green-400 p-4">
                    <div className="text-sm mb-3">INSTRUCTIONS:</div>
                    <div className="text-xs text-green-600 space-y-1">
                      <div>{">"} Open your authenticator app</div>
                      <div>{">"} Scan the QR code above</div>
                      <div>{">"} Enter the generated code when prompted</div>
                      <div>{">"} Keep your device secure</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                  {qr && !loading && !error && (
                    <button
                      onClick={handleRetry}
                      className="w-full border border-green-400 bg-black text-green-400 py-2 px-4 hover:bg-green-400 hover:text-black transition-colors duration-200 flex items-center justify-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      REGENERATE_QR
                    </button>
                  )}

                  {onBack && (
                    <button
                      onClick={onBack}
                      className="w-full border border-green-400 bg-black text-green-400 py-2 px-4 hover:bg-green-400 hover:text-black transition-colors duration-200"
                    >
                      BACK_TO_PREVIOUS
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-6 text-xs text-green-600">
                  <div>QRNG System v2.1.4 | Quantum QR Code Generator</div>
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
};

export default QrPage;