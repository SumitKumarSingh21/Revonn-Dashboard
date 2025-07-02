
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Settings, Trash2 } from "lucide-react";

interface MechanicActionsProps {
  mechanicId: string;
  mechanicName: string;
  currentStatus: string;
  onStatusChange: () => void;
  onDelete: () => void;
}

const MechanicActions = ({ mechanicId, mechanicName, currentStatus, onStatusChange, onDelete }: MechanicActionsProps) => {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const toggleMechanicStatus = async () => {
    setUpdating(true);
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from("mechanics")
        .update({ status: newStatus })
        .eq("id", mechanicId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Mechanic ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      });
      
      onStatusChange();
    } catch (error) {
      console.error("Error updating mechanic status:", error);
      toast({
        title: "Error",
        description: "Failed to update mechanic status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const deleteMechanic = async () => {
    if (!confirm(`Are you sure you want to delete ${mechanicName}?`)) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("mechanics")
        .delete()
        .eq("id", mechanicId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mechanic deleted successfully",
      });
      
      onDelete();
    } catch (error) {
      console.error("Error deleting mechanic:", error);
      toast({
        title: "Error",
        description: "Failed to delete mechanic",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleMechanicStatus}
        disabled={updating}
        title={`${currentStatus === 'active' ? 'Deactivate' : 'Activate'} mechanic`}
      >
        <Settings className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={deleteMechanic}
        disabled={deleting}
        className="text-red-600 hover:text-red-700"
        title="Delete mechanic"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MechanicActions;
