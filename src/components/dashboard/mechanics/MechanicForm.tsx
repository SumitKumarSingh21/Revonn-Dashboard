
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import MechanicPhotoUpload from "./MechanicPhotoUpload";

interface MechanicFormProps {
  onMechanicAdded: () => void;
}

const MechanicForm = ({ onMechanicAdded }: MechanicFormProps) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    photo_url: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  const generateUniqueMechanicId = async (garageId: string) => {
    try {
      console.log("Starting unique ID generation for garage:", garageId);
      
      // Get all existing mechanic IDs for this specific garage
      const { data: existingMechanics, error: fetchError } = await supabase
        .from("mechanics")
        .select("mechanic_id")
        .eq("garage_id", garageId)
        .order("mechanic_id");

      if (fetchError) {
        console.error("Error fetching existing mechanics:", fetchError);
        throw fetchError;
      }

      const existingIds = new Set((existingMechanics || []).map(m => m.mechanic_id));
      console.log("Existing mechanic IDs:", Array.from(existingIds));
      
      // Try MECH format first (MECH001, MECH002, etc.)
      for (let counter = 1; counter <= 999; counter++) {
        const newId = 'MECH' + String(counter).padStart(3, '0');
        if (!existingIds.has(newId)) {
          console.log("Generated unique mechanic ID:", newId);
          return newId;
        }
      }
      
      // Fallback to timestamp-based ID if all MECH IDs are taken
      const timestampId = 'MECH' + Date.now().toString().slice(-6);
      console.log("Using timestamp-based ID:", timestampId);
      return timestampId;
      
    } catch (error) {
      console.error("Error in generateUniqueMechanicId:", error);
      // Ultimate fallback
      const fallbackId = 'MECH' + Math.random().toString(36).substr(2, 6).toUpperCase();
      console.log("Using fallback random ID:", fallbackId);
      return fallbackId;
    }
  };

  const handleAddMechanic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Mechanic name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.photo_url) {
      toast({
        title: "Error",
        description: "Mechanic photo is required for ID card generation",
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);

    try {
      console.log("Starting mechanic addition process...");
      
      // Get current user and garage
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user.user) {
        throw new Error("Authentication required");
      }

      const { data: garage, error: garageError } = await supabase
        .from("garages")
        .select("id")
        .eq("owner_id", user.user.id)
        .single();

      if (garageError || !garage) {
        throw new Error("Garage not found. Please create a garage first.");
      }

      console.log("Found garage:", garage.id);

      // Generate unique mechanic ID
      const mechanicId = await generateUniqueMechanicId(garage.id);

      const insertData = {
        garage_id: garage.id,
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        photo_url: formData.photo_url,
        mechanic_id: mechanicId,
        status: 'active'
      };

      console.log("Inserting mechanic with data:", insertData);

      const { error: insertError } = await supabase
        .from("mechanics")
        .insert(insertData);

      if (insertError) {
        console.error("Insert error:", insertError);
        if (insertError.code === '23505') {
          // If we still get a duplicate key error, try one more time with a random ID
          const randomId = 'MECH' + Math.random().toString(36).substr(2, 8).toUpperCase();
          const retryData = { ...insertData, mechanic_id: randomId };
          
          console.log("Retrying with random ID:", retryData);
          const { error: retryError } = await supabase
            .from("mechanics")
            .insert(retryData);
            
          if (retryError) {
            throw retryError;
          }
        } else {
          throw insertError;
        }
      }

      toast({
        title: "Success",
        description: "Mechanic added successfully with photo and ID card ready!",
      });

      // Reset form and close dialog
      setFormData({ name: "", phone: "", email: "", photo_url: "" });
      setAddDialogOpen(false);
      onMechanicAdded();

    } catch (error) {
      console.error("Error adding mechanic:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add mechanic. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handlePhotoUploaded = (photoUrl: string) => {
    setFormData({ ...formData, photo_url: photoUrl });
  };

  return (
    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Mechanic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Mechanic</DialogTitle>
          <DialogDescription>
            Add a new mechanic with photo for automatic ID card generation. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddMechanic} className="space-y-4">
          <MechanicPhotoUpload
            onPhotoUploaded={handlePhotoUploaded}
            currentPhoto={formData.photo_url}
          />
          
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter mechanic's full name"
              required
              disabled={formLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
              disabled={formLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              disabled={formLoading}
            />
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={formLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading} className="w-full sm:w-auto">
              {formLoading ? "Adding..." : "Add Mechanic"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MechanicForm;
