
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MechanicActionsProps {
  mechanicId: string;
  mechanicName: string;
  currentStatus: string;
  onStatusChange: () => void;
  onDelete: () => void;
}

const MechanicActions = ({ 
  mechanicId, 
  mechanicName, 
  currentStatus, 
  onStatusChange, 
  onDelete 
}: MechanicActionsProps) => {
  const [updating, setUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
        description: `Mechanic ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
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

  const handleDelete = async () => {
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
      
      setShowDeleteDialog(false);
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
    <>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={updating || deleting}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={toggleMechanicStatus} disabled={updating}>
              <Settings className="h-4 w-4 mr-2" />
              {currentStatus === 'active' ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 focus:text-red-600"
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mechanic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{mechanicName}</strong>? 
              This action cannot be undone and will remove the mechanic from all future bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MechanicActions;
