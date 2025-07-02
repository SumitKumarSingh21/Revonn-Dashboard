
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Mechanic {
  id: string;
  name: string;
  mechanic_id: string;
  status: string;
}

interface MechanicAssignmentSelectProps {
  bookingId: string;
  currentMechanicId?: string | null;
  onAssignmentChange?: (mechanicId: string | null, mechanicName: string | null) => void;
}

const MechanicAssignmentSelect = ({ 
  bookingId, 
  currentMechanicId, 
  onAssignmentChange 
}: MechanicAssignmentSelectProps) => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMechanics();
  }, []);

  const loadMechanics = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: garage } = await supabase
        .from("garages")
        .select("id")
        .eq("owner_id", user.user.id)
        .single();

      if (!garage) return;

      const { data, error } = await supabase
        .from("mechanics")
        .select("id, name, mechanic_id, status")
        .eq("garage_id", garage.id)
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setMechanics(data || []);
    } catch (error) {
      console.error("Error loading mechanics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async (mechanicId: string) => {
    if (mechanicId === "unassign") {
      await updateBookingAssignment(null, null);
      return;
    }

    const selectedMechanic = mechanics.find(m => m.id === mechanicId);
    if (selectedMechanic) {
      await updateBookingAssignment(mechanicId, selectedMechanic.name);
    }
  };

  const updateBookingAssignment = async (mechanicId: string | null, mechanicName: string | null) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ 
          assigned_mechanic_id: mechanicId,
          assigned_mechanic_name: mechanicName,
          assigned_at: mechanicId ? new Date().toISOString() : null
        })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: mechanicId 
          ? `Mechanic ${mechanicName} assigned successfully`
          : "Mechanic unassigned successfully",
      });

      // Notify parent component
      onAssignmentChange?.(mechanicId, mechanicName);

      // Send notification to customer (placeholder for now)
      if (mechanicId && mechanicName) {
        console.log(`Notification: Mechanic ${mechanicName} assigned to booking ${bookingId}`);
        // Here you would implement the actual notification system
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update mechanic assignment",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading mechanics...</div>;
  }

  if (mechanics.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No active mechanics available
      </div>
    );
  }

  const currentMechanic = currentMechanicId 
    ? mechanics.find(m => m.id === currentMechanicId)
    : null;

  return (
    <div className="space-y-2">
      {currentMechanic && (
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">
            {currentMechanic.name} ({currentMechanic.mechanic_id})
          </Badge>
        </div>
      )}
      
      <Select 
        onValueChange={handleAssignment}
        disabled={updating}
        value={currentMechanicId || ""}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={
            updating 
              ? "Updating..." 
              : currentMechanic 
                ? "Change assignment" 
                : "Assign mechanic"
          } />
        </SelectTrigger>
        <SelectContent className="bg-white z-50">
          {currentMechanicId && (
            <SelectItem value="unassign" className="text-red-600">
              Unassign Mechanic
            </SelectItem>
          )}
          {mechanics.map((mechanic) => (
            <SelectItem 
              key={mechanic.id} 
              value={mechanic.id}
              disabled={mechanic.id === currentMechanicId}
            >
              {mechanic.name} ({mechanic.mechanic_id})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MechanicAssignmentSelect;
