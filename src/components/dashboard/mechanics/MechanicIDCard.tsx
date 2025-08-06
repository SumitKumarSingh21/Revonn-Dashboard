
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, CreditCard, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Mechanic {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  mechanic_id: string;
  photo_url: string | null;
  created_at: string;
}

interface Garage {
  name: string;
  location?: string;
}

interface MechanicIDCardProps {
  mechanic: Mechanic;
  garage: Garage;
}

const MechanicIDCard = ({ mechanic, garage }: MechanicIDCardProps) => {
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const [showBack, setShowBack] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const { toast } = useToast();

  // Generate QR code data URL
  const generateQRCode = async () => {
    try {
      const QRCode = (await import('qrcode')).default;
      const qrData = JSON.stringify({
        mechanic_id: mechanic.mechanic_id,
        name: mechanic.name,
        garage: garage.name,
        location: garage.location,
        verified_by: "Revonn",
        verification_url: `https://revonn.com/verify/${mechanic.mechanic_id}`
      });
      
      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 120,
        margin: 1,
        color: {
          dark: '#ffffff',
          light: '#dc2626'
        }
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Generate QR code on component mount
  useState(() => {
    generateQRCode();
  });

  const downloadIDCard = async () => {
    if (!frontCardRef.current || !backCardRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      
      // Capture front side
      const frontCanvas = await html2canvas(frontCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        width: 400,
        height: 250,
        useCORS: true,
      });

      // Capture back side
      const backCanvas = await html2canvas(backCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        width: 400,
        height: 250,
        useCORS: true,
      });

      // Create a combined canvas
      const combinedCanvas = document.createElement('canvas');
      combinedCanvas.width = frontCanvas.width * 2 + 40; // Add some spacing
      combinedCanvas.height = frontCanvas.height;
      const ctx = combinedCanvas.getContext('2d');

      if (ctx) {
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
        
        // Add front side
        ctx.drawImage(frontCanvas, 0, 0);
        
        // Add back side with spacing
        ctx.drawImage(backCanvas, frontCanvas.width + 40, 0);
        
        // Add labels
        ctx.fillStyle = '#374151';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FRONT', frontCanvas.width / 2, combinedCanvas.height + 40);
        ctx.fillText('BACK', frontCanvas.width + 40 + backCanvas.width / 2, combinedCanvas.height + 40);
      }

      // Download the combined image
      const link = document.createElement('a');
      link.download = `${mechanic.name}-Revonn-ID-Card.png`;
      link.href = combinedCanvas.toDataURL('image/png', 1.0);
      link.click();

      toast({
        title: "Success",
        description: "ID card downloaded successfully!",
      });
    } catch (error) {
      console.error('Error downloading ID card:', error);
      toast({
        title: "Error",
        description: "Failed to download ID card. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Preview with Flip Animation */}
      <div className="relative mx-auto" style={{ perspective: '1000px' }}>
        <div 
          className={`relative transition-transform duration-700 transform-style-preserve-3d ${showBack ? 'rotate-y-180' : ''}`}
          style={{ 
            width: '400px', 
            height: '250px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Front Side */}
          <div 
            ref={frontCardRef}
            className={`absolute inset-0 backface-hidden ${showBack ? 'opacity-0' : 'opacity-100'}`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-6 rounded-xl shadow-2xl text-white w-full h-full relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
              </div>
              
              {/* Header */}
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-bold tracking-wider">AUTHORIZED MECHANIC</div>
                  <div className="text-xs opacity-90 mt-1">REVONN CERTIFIED</div>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <CreditCard className="h-6 w-6 text-red-600" />
                </div>
              </div>

              {/* Main Content */}
              <div className="relative z-10 flex gap-4">
                {/* Photo */}
                <div className="w-20 h-20 bg-white rounded-lg border-3 border-red-200 overflow-hidden flex-shrink-0 shadow-lg">
                  {mechanic.photo_url ? (
                    <img
                      src={mechanic.photo_url}
                      alt={mechanic.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Photo</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1 truncate">{mechanic.name}</h3>
                  <p className="text-sm opacity-90 mb-2 font-mono">ID: {mechanic.mechanic_id}</p>
                  {mechanic.phone && (
                    <p className="text-sm opacity-80 truncate mb-1">📞 {mechanic.phone}</p>
                  )}
                  {mechanic.email && (
                    <p className="text-sm opacity-80 truncate">✉️ {mechanic.email}</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 mt-4 pt-3 border-t border-red-400">
                <div className="flex justify-between items-end">
                  <div className="flex-1">
                    <p className="text-sm font-semibold truncate">{garage.name}</p>
                    {garage.location && (
                      <p className="text-xs opacity-80 truncate">📍 {garage.location}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-80">Valid</p>
                    <p className="text-sm font-bold">{new Date().getFullYear()}</p>
                  </div>
                </div>
              </div>

              {/* Revonn Branding */}
              <div className="absolute bottom-2 right-4 text-xs opacity-60 font-bold tracking-widest">
                REVONN
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div 
            ref={backCardRef}
            className={`absolute inset-0 backface-hidden transform rotate-y-180 ${!showBack ? 'opacity-0' : 'opacity-100'}`}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="bg-gradient-to-br from-red-800 via-red-700 to-red-600 p-6 rounded-xl shadow-2xl text-white w-full h-full relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              {/* Header */}
              <div className="relative z-10 text-center mb-6">
                <h3 className="text-xl font-bold tracking-wider">REVONN</h3>
                <p className="text-sm opacity-90">Verified Mechanic Certification</p>
              </div>

              {/* QR Code Section */}
              <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                <div className="bg-white p-3 rounded-lg shadow-lg mb-3">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded">
                      <span className="text-xs text-gray-500">Loading...</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-center opacity-90 mb-2">
                  Scan to verify mechanic authenticity
                </p>
                <p className="text-xs text-center opacity-75 font-mono">
                  ID: {mechanic.mechanic_id}
                </p>
              </div>

              {/* Footer */}
              <div className="relative z-10 text-center mt-4 pt-3 border-t border-red-400">
                <p className="text-xs opacity-80">
                  This certificate verifies that the mechanic is
                </p>
                <p className="text-xs opacity-80">
                  authorized by <span className="font-bold">REVONN</span> from <span className="font-semibold">{garage.name}</span>
                </p>
                <p className="text-xs opacity-60 mt-2">
                  For verification: revonn.com/verify
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button 
          onClick={() => setShowBack(!showBack)}
          variant="outline"
          className="flex-1"
          size="sm"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {showBack ? 'Show Front' : 'Show Back'}
        </Button>
        
        <Button 
          onClick={downloadIDCard}
          className="flex-1 bg-red-600 hover:bg-red-700"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Download ID Card
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">ID Card Features:</p>
        <ul className="text-xs space-y-1 list-disc list-inside">
          <li>Front: Professional mechanic details with photo</li>
          <li>Back: QR code for customer verification</li>
          <li>Downloads as a single image with both sides</li>
          <li>QR code links to Revonn verification system</li>
        </ul>
      </div>
    </div>
  );
};

export default MechanicIDCard;
