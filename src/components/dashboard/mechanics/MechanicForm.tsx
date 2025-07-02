
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface MechanicFormProps {
  onMechanicAdded: () => void;
}

const MechanicForm = ({ onMechanicAdded }: MechanicFormProps) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  const generateUniqueMechanicId = async () => {
    // Get current user's garage to scope the search
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data: garage } = await supabase
      .from("garages")
      .select("id")
      .eq("owner_id", user.user.id)
      .single();

    if (!garage) throw new Error("Garage not found");

    // Get all existing mechanic IDs for this garage
    const { data: existingMechanics } = await supabase
      .from("mechanics")
      .select("mechanic_id")
      .eq("garage_id", garage.id);

    const existingIds = new Set(existingMechanics?.map(m => m.mechanic_id) || []);
    
    // Find the next available ID
    let counter = 1;
    let newId;
    
    do {
      newId = 'MECH' + String(counter).padStart(3, '0');
      counter++;
    } while (existingIds.has(newId) && counter <= 999);
    
    // If we've exhausted all possibilities, use timestamp
    if (counter > 999) {
      newId = 'MECH' + Date.now().toString().slice(-6);
    }
    
    console.log("Generated unique mechanic ID:", newId);
    return newId;
  };

  const handleAddMechanic = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: garage } = await supabase
        .from("garages")
        .select("id")
        .eq("owner_id", user.user.id)
        .single();

      if (!garage) throw new Error("Garage not found");

      // Generate a unique mechanic ID
      const mechanicId = await generateUniqueMechanicId();

      const insertData = {
        garage_id: garage.id,
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        mechanic_id: mechanicId,
      };

      console.log("Inserting mechanic with data:", insertData);

      const { error } = await supabase
        .from("mechanics")
        .insert(insertData);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Mechanic added successfully",
      });

      setFormData({ name: "", phone: "", email: "" });
      setAddDialogOpen(false);
      onMechanicAdded();
    } catch (error) {
      console.error("Error adding mechanic:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add mechanic",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Mechanic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Mechanic</DialogTitle>
          <DialogDescription>
            Add a new mechanic to your garage. A unique mechanic ID will be generated automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddMechanic} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter mechanic's full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
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
