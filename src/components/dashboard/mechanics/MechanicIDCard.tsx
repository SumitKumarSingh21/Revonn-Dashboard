
import { useRef, useState, useEffect } from "react";
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

  // Generate QR code data URL - unique for each mechanic
  const generateQRCode = async () => {
    try {
      const QRCode = (await import('qrcode')).default;
      
      // Create unique QR data for each mechanic
      const qrData = JSON.stringify({
        mechanic_id: mechanic.mechanic_id,
        name: mechanic.name,
        garage: garage.name,
        location: garage.location || 'Location not specified',
        verified_by: "Revonn",
        verification_url: `https://revonn.com/verify/${mechanic.mechanic_id}`,
        timestamp: new Date().toISOString(),
        unique_id: `${mechanic.id}-${Date.now()}`
      });
      
      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 140,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#dc2626'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeUrl(qrUrl);
      console.log(`Generated QR code for mechanic: ${mechanic.name} (ID: ${mechanic.mechanic_id})`);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Warning",
        description: "QR code generation failed, but ID card will still work.",
        variant: "destructive"
      });
    }
  };

  // Generate QR code when component mounts or mechanic changes
  useEffect(() => {
    generateQRCode();
  }, [mechanic.id, mechanic.mechanic_id]);

  const downloadIDCard = async () => {
    if (!frontCardRef.current || !backCardRef.current) {
      toast({
        title: "Error",
        description: "Card elements not ready. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      
      // Wait a moment to ensure QR code is loaded
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture front side with better options
      const frontCanvas = await html2canvas(frontCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        width: 450,
        height: 280,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure all images are loaded in the cloned document
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            img.style.maxWidth = 'none';
            img.style.maxHeight = 'none';
          });
        }
      });

      // Capture back side with better options
      const backCanvas = await html2canvas(backCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        width: 450,
        height: 280,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure all images are loaded in the cloned document
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            img.style.maxWidth = 'none';
            img.style.maxHeight = 'none';
          });
        }
      });

      // Create a combined canvas with proper spacing
      const combinedCanvas = document.createElement('canvas');
      const spacing = 60;
      combinedCanvas.width = (frontCanvas.width * 2) + spacing;
      combinedCanvas.height = frontCanvas.height + 100; // Extra space for labels
      const ctx = combinedCanvas.getContext('2d');

      if (ctx) {
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
        
        // Add front side
        ctx.drawImage(frontCanvas, 0, 50);
        
        // Add back side with spacing
        ctx.drawImage(backCanvas, frontCanvas.width + spacing, 50);
        
        // Add labels with better formatting
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        
        // Front label
        ctx.fillText('FRONT', frontCanvas.width / 2, 35);
        ctx.fillText('BACK', frontCanvas.width + spacing + (backCanvas.width / 2), 35);
        
        // Add mechanic info at bottom
        ctx.font = '20px Arial';
        ctx.fillStyle = '#6b7280';
        const bottomY = combinedCanvas.height - 20;
        ctx.fillText(`${mechanic.name} - ID: ${mechanic.mechanic_id}`, combinedCanvas.width / 2, bottomY);
      }

      // Download the combined image
      const link = document.createElement('a');
      link.download = `${mechanic.name.replace(/\s+/g, '-')}-Revonn-ID-Card-${mechanic.mechanic_id}.png`;
      link.href = combinedCanvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: `ID card for ${mechanic.name} downloaded successfully!`
      });
      
      console.log(`Downloaded ID card for: ${mechanic.name} (${mechanic.mechanic_id})`);
    } catch (error) {
      console.error('Error downloading ID card:', error);
      toast({
        title: "Error", 
        description: "Failed to download ID card. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Preview with Flip Animation */}
      <div className="relative mx-auto" style={{ perspective: '1000px' }}>
        <div 
          className={`relative transition-transform duration-700 ${showBack ? '[transform:rotateY(180deg)]' : ''}`}
          style={{ 
            width: '450px', 
            height: '280px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Front Side */}
          <div 
            ref={frontCardRef}
            className={`absolute inset-0 w-full h-full ${showBack ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)'
            }}
          >
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-6 rounded-2xl shadow-2xl text-white w-full h-full relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
                <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white rounded-full"></div>
              </div>
              
              {/* Header */}
              <div className="relative z-10 flex items-center justify-between mb-5">
                <div>
                  <div className="text-lg font-bold tracking-wider">AUTHORIZED MECHANIC</div>
                  <div className="text-sm opacity-90 mt-1 tracking-wide">REVONN CERTIFIED</div>
                </div>
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <CreditCard className="h-7 w-7 text-red-600" />
                </div>
              </div>

              {/* Main Content */}
              <div className="relative z-10 flex gap-5">
                {/* Photo */}
                <div className="w-24 h-24 bg-white rounded-xl border-4 border-red-200 overflow-hidden flex-shrink-0 shadow-xl">
                  {mechanic.photo_url ? (
                    <img
                      src={mechanic.photo_url}
                      alt={mechanic.name}
                      className="w-full h-full object-cover"
                      style={{ maxWidth: 'none', maxHeight: 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Photo</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xl mb-2 truncate leading-tight">{mechanic.name}</h3>
                  <p className="text-sm opacity-90 mb-3 font-mono tracking-wide">ID: {mechanic.mechanic_id}</p>
                  {mechanic.phone && (
                    <p className="text-sm opacity-85 truncate mb-2 flex items-center">
                      <span className="mr-2">📞</span> {mechanic.phone}
                    </p>
                  )}
                  {mechanic.email && (
                    <p className="text-sm opacity-85 truncate flex items-center">
                      <span className="mr-2">✉️</span> {mechanic.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 mt-6 pt-4 border-t-2 border-red-400">
                <div className="flex justify-between items-end">
                  <div className="flex-1">
                    <p className="text-base font-semibold truncate">{garage.name}</p>
                    {garage.location && (
                      <p className="text-sm opacity-85 truncate mt-1">📍 {garage.location}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-80">Valid</p>
                    <p className="text-lg font-bold">{new Date().getFullYear()}</p>
                  </div>
                </div>
              </div>

              {/* Revonn Branding */}
              <div className="absolute bottom-3 right-5 text-sm opacity-70 font-bold tracking-widest">
                REVONN
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div 
            ref={backCardRef}
            className={`absolute inset-0 w-full h-full ${!showBack ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="bg-gradient-to-br from-red-800 via-red-700 to-red-600 p-6 rounded-2xl shadow-2xl text-white w-full h-full relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              {/* Header */}
              <div className="relative z-10 text-center mb-8">
                <h3 className="text-2xl font-bold tracking-wider mb-2">REVONN</h3>
                <p className="text-sm opacity-90 tracking-wide">Verified Mechanic Certification</p>
                <div className="w-16 h-1 bg-white opacity-60 mx-auto mt-3"></div>
              </div>

              {/* QR Code Section - Centered and Prominent */}
              <div className="relative z-10 flex flex-col items-center justify-center flex-1 space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-2xl">
                  {qrCodeUrl ? (
                    <img 
                      src={qrCodeUrl} 
                      alt={`QR Code for ${mechanic.name}`} 
                      className="w-32 h-32"
                      style={{ maxWidth: 'none', maxHeight: 'none' }}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                        <span className="text-xs text-gray-500">Loading QR...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm opacity-95 font-medium">
                    Scan to verify mechanic authenticity
                  </p>
                  <p className="text-xs opacity-80 font-mono bg-red-600 px-3 py-1 rounded">
                    ID: {mechanic.mechanic_id}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 text-center mt-6 pt-4 border-t-2 border-red-400">
                <p className="text-xs opacity-85 mb-1">
                  This certificate verifies that <span className="font-semibold">{mechanic.name}</span>
                </p>
                <p className="text-xs opacity-85 mb-2">
                  is authorized by <span className="font-bold">REVONN</span> from <span className="font-semibold">{garage.name}</span>
                </p>
                <p className="text-xs opacity-70 font-mono">
                  Verify at: revonn.com/verify/{mechanic.mechanic_id}
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
          className="flex-1 border-red-200 hover:bg-red-50"
          size="sm"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {showBack ? 'Show Front' : 'Show Back'}
        </Button>
        
        <Button 
          onClick={downloadIDCard}
          className="flex-1 bg-red-600 hover:bg-red-700"
          size="sm"
          disabled={!qrCodeUrl}
        >
          <Download className="h-4 w-4 mr-2" />
          Download ID Card
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
        <p className="font-medium mb-2 text-red-700">🆔 ID Card Features:</p>
        <ul className="text-xs space-y-1.5 list-disc list-inside">
          <li><strong>Unique QR Code:</strong> Each mechanic gets a unique QR code for verification</li>
          <li><strong>Professional Design:</strong> Red Revonn branding with modern layout</li>
          <li><strong>Download Ready:</strong> High-quality image with both front and back sides</li>
          <li><strong>Customer Verification:</strong> QR code links to Revonn verification system</li>
          <li><strong>Mechanic Details:</strong> Includes photo, contact info, and garage information</li>
        </ul>
      </div>
    </div>
  );
};

export default MechanicIDCard;
