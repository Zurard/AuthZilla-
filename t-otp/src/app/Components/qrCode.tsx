import { useState, useEffect } from 'react';
import Image from 'next/image';

interface QRCodeProps {
  data: string;
}

export default function QRCode({ data }: QRCodeProps) {
  const [qrImage, setQrImage] = useState<string>('');

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const response = await fetch('http://localhost:5000/generate_qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data }),
        });
        
        if (!response.ok) throw new Error('QR generation failed');
        
        const blob = await response.blob(); // convert the response to a blob ie it handles binary data of the response
        const imageUrl = URL.createObjectURL(blob);
        setQrImage(imageUrl);
      } catch (error) {
        console.error('Error generating QR:', error);
      }
    };

    if (data) fetchQR();
  }, [data]);

  return (
    <div className="flex justify-center items-center p-4">
      {qrImage && (
        <div className="border-2 border-green-400 p-4">
          <Image 
            src={qrImage} 
            alt="QR Code"
            width={256}
            height={256}
            className="w-64 h-64"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}