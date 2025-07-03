
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

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
    
    // Set up real-time subscription for mechanics changes
    console.log("Setting up mechanic assignment real-time subscription...");
    const channel = supabase
      .channel("mechanics-assignment-realtime")
      .on(
        "postgres_changes", 
        { 
          event: "*", 
          schema: "public", 
          table: "mechanics" 
        }, 
        (payload) => {
          console.log("Mechanics changed for assignment:", payload);
          loadMechanics();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up mechanic assignment subscription...");
      supabase.removeChannel(channel);
    };
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
      console.error("Error loading mechanics for assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async (value: string) => {
    if (value === "unassign") {
      await updateBookingAssignment(null, null);
      return;
    }

    const selectedMechanic = mechanics.find(m => m.id === value);
    if (selectedMechanic) {
      await updateBookingAssignment(value, selectedMechanic.name);
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

      console.log(`Mechanic assignment updated: ${mechanicName || 'Unassigned'} for booking ${bookingId}`);
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
      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>No active mechanics available. Add mechanics first to assign them to bookings.</span>
        </div>
      </div>
    );
  }

  const currentMechanic = currentMechanicId 
    ? mechanics.find(m => m.id === currentMechanicId)
    : null;

  return (
    <div className="space-y-3">
      {currentMechanic && (
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
            <User className="h-3 w-3 mr-1" />
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
        <SelectContent className="bg-white border shadow-lg z-50">
          {currentMechanicId && (
            <SelectItem value="unassign" className="text-red-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Unassign Mechanic
              </div>
            </SelectItem>
          )}
          {mechanics.map((mechanic) => (
            <SelectItem 
              key={mechanic.id} 
              value={mechanic.id}
              disabled={mechanic.id === currentMechanicId}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {mechanic.name} ({mechanic.mechanic_id})
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MechanicAssignmentSelect;
