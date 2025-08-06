
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Phone, Mail, Eye } from "lucide-react";
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Photo */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {mechanic.photo_url ? (
              <img
                src={mechanic.photo_url}
                alt={mechanic.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-xs">No Photo</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 truncate">{mechanic.name}</h3>
                <p className="text-sm text-gray-600">ID: {mechanic.mechanic_id}</p>
              </div>
              <Badge 
                variant={mechanic.status === 'active' ? 'default' : 'secondary'}
                className="ml-2"
              >
                {mechanic.status}
              </Badge>
            </div>

            {/* Contact Info */}
            <div className="space-y-1 mb-3">
              {mechanic.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3 w-3" />
                  <span className="truncate">{mechanic.phone}</span>
                </div>
              )}
              {mechanic.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{mechanic.email}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Dialog open={showIDCard} onOpenChange={setShowIDCard}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex-1">
                    <CreditCard className="h-3 w-3 mr-1" />
                    ID Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Mechanic ID Card</DialogTitle>
                  </DialogHeader>
                  <MechanicIDCard mechanic={mechanic} garage={garage} />
                </DialogContent>
              </Dialog>

              <MechanicActions 
                mechanicId={mechanic.id}
                mechanicName={mechanic.name}
                currentStatus={mechanic.status}
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
