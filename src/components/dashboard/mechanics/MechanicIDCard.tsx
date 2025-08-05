
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, CreditCard } from "lucide-react";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const downloadIDCard = async () => {
    if (!cardRef.current) return;

    try {
      // Use html2canvas to capture the ID card
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        width: 600,
        height: 380,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${mechanic.name}-ID-Card.png`;
      link.href = canvas.toDataURL();
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
    <div className="space-y-4">
      {/* ID Card Preview */}
      <div 
        ref={cardRef}
        className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg text-white mx-auto"
        style={{ width: '300px', height: '190px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold">AUTHORIZED MECHANIC</div>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-blue-600" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-3">
          {/* Photo */}
          <div className="w-16 h-16 bg-white rounded border-2 border-blue-200 overflow-hidden flex-shrink-0">
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
            <h3 className="font-bold text-sm truncate">{mechanic.name}</h3>
            <p className="text-xs opacity-90 mb-1">ID: {mechanic.mechanic_id}</p>
            {mechanic.phone && (
              <p className="text-xs opacity-80 truncate">{mechanic.phone}</p>
            )}
            {mechanic.email && (
              <p className="text-xs opacity-80 truncate">{mechanic.email}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-blue-400">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold truncate">{garage.name}</p>
              {garage.location && (
                <p className="text-xs opacity-80 truncate">{garage.location}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Valid</p>
              <p className="text-xs font-bold">{new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <Button 
        onClick={downloadIDCard}
        className="w-full"
        size="sm"
      >
        <Download className="h-4 w-4 mr-2" />
        Download ID Card
      </Button>
    </div>
  );
};

export default MechanicIDCard;
