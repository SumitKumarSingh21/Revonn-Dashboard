
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Phone, Mail } from "lucide-react";
import MechanicIDCard from "./MechanicIDCard";
import MechanicActions from "./MechanicActions";

interface Mechanic {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  mechanic_id: string;
  photo_url: string | null;
  status: string;
  created_at: string;
  garage_id: string;
}

interface Garage {
  name: string;
  location?: string;
}

interface MechanicCardProps {
  mechanic: Mechanic;
  garage: Garage;
  onMechanicChange: () => void;
}

const MechanicCard = ({ mechanic, garage, onMechanicChange }: MechanicCardProps) => {
  const [showIDCard, setShowIDCard] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Photo */}
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 shadow-md border-2 border-white">
            {mechanic.photo_url ? (
              <img
                src={mechanic.photo_url}
                alt={mechanic.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
                <span className="text-xs font-medium">No Photo</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 truncate text-lg">{mechanic.name}</h3>
                <p className="text-sm text-gray-600 font-mono">ID: {mechanic.mechanic_id}</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <Badge 
                  variant={mechanic.status === 'active' ? 'default' : 'secondary'}
                  className={mechanic.status === 'active' 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'
                  }
                >
                  {mechanic.status === 'active' ? '🟢 Active' : '⚪ Inactive'}
                </Badge>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1 mb-4">
              {mechanic.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3 w-3 text-red-500" />
                  <span className="truncate">{mechanic.phone}</span>
                </div>
              )}
              {mechanic.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3 w-3 text-red-500" />
                  <span className="truncate">{mechanic.email}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-center">
              <Dialog open={showIDCard} onOpenChange={setShowIDCard}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-md">
                    <CreditCard className="h-3 w-3 mr-2" />
                    View ID Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-center text-lg font-bold text-gray-800">
                      🆔 Revonn Mechanic ID Card
                    </DialogTitle>
                  </DialogHeader>
                  <MechanicIDCard mechanic={mechanic} garage={garage} />
                </DialogContent>
              </Dialog>

              <MechanicActions 
                mechanicId={mechanic.id}
                mechanicName={mechanic.name}
                currentStatus={mechanic.status}
                photoUrl={mechanic.photo_url}
                onStatusChange={onMechanicChange}
                onDelete={onMechanicChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MechanicCard;
